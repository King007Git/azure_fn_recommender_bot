import uuid
import asyncio
import pandas as pd
from typing import TypedDict, List, Dict, Any
from pinecone import Pinecone
from langchain_huggingface import HuggingFaceEmbeddings
from langgraph.graph import StateGraph, START, END

# New imports for Generative Answer
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

from config import settings

# Define the LangGraph State
class GraphState(TypedDict):
    query: str
    top_k: int
    threshold: float
    results: List[Dict[str, Any]]

class TicketAgent:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index = self.pc.Index(settings.PINECONE_INDEX_NAME)
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        
        # Build LangGraph for Retrieval Workflow
        workflow = StateGraph(GraphState)
        workflow.add_node("retrieve", self._retrieve_node)
        workflow.add_edge(START, "retrieve")
        workflow.add_edge("retrieve", END)
        self.app = workflow.compile()

    def _retrieve_node(self, state: GraphState) -> Dict:
        """LangGraph node to query Pinecone and filter by confidence score."""
        query_vec = self.embeddings.embed_query(state["query"])
        res = self.index.query(
            vector=query_vec,
            top_k=state["top_k"],
            include_metadata=True
        )
        
        valid_matches = []
        for match in res["matches"]:
            if match["score"] >= state["threshold"]:
                valid_matches.append({
                    "id": match["id"],
                    "score": match["score"],
                    "number": match["metadata"].get("number",""),
                    "short_description": match["metadata"].get("short_description", ""),
                    "resolution": match["metadata"].get("resolution", ""),
                    "desc": match['metadata'].get('description',''),
                    "priority": match['metadata'].get('priority',''),
                    "issue_desc": match['metadata'].get('issue_desc',''),
                    "rca": match['metadata'].get('rca',''),
                    "workaround": match['metadata'].get('workaround','')
                })
        return {"results": valid_matches}

    async def ingest_csv(self, file_path: str):
        """Asynchronously read CSV and upload vectors in batches."""
        loop = asyncio.get_event_loop()
        
        def read_data():
            return pd.read_csv(file_path, encoding='latin1', encoding_errors='replace')
        df = await loop.run_in_executor(None, read_data)
        
        batch_size = 100
        vectors = []
        
        for _, row in df.iterrows():
            text_to_embed = str(row['Short Description'])
            metadata = {
                "short_description": text_to_embed,
                "number": str(row.get('Incident Number', '')),
                "description": str(row.get('Description', '')),
                "priority": str(row.get('Priority', '')),
                "resolution": str(row.get('Resolution Notes', '')),
                "issue_desc": str(row.get('Issue Description', '')),
                "rca": str(row.get('RCA','')),
                "workaround": str(row.get('Workaround',''))
            }
            vectors.append({"id": str(uuid.uuid4()), "text": text_to_embed, "metadata": metadata})
            
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i+batch_size]
            texts = [v["text"] for v in batch]
            embs = self.embeddings.embed_documents(texts)
            
            upsert_data = [(v["id"], embs[j], v["metadata"]) for j, v in enumerate(batch)]
            self.index.upsert(vectors=upsert_data)

    def retrieve(self, query: str, top_k: int, threshold: float) -> List:
        """Triggers the LangGraph workflow."""
        initial_state = {"query": query, "top_k": top_k, "threshold": threshold, "results": []}
        result = self.app.invoke(initial_state)
        return result["results"]

    def retrieve_unique(self, query: str, top_k: int, threshold: float) -> list:
        raw_results = self.retrieve(query, 30, threshold)
        sorted_results = sorted(raw_results, key=lambda x: x["score"], reverse=True)
        
        unique_results = []
        seen_descriptions = set()
        
        for ticket in sorted_results:
            desc = str(ticket.get("short_description") or "").strip().lower()
            
            if desc in seen_descriptions:
                continue
                
            seen_descriptions.add(desc)
            unique_results.append(ticket)
            
            if len(unique_results) >= top_k:
                break
                
        return unique_results

    def feedback(self, query: str, short_desc: str, resolution: str, desc: str, priority: str, issue_desc: str, rca: str, workaround: str):
        query_vec = self.embeddings.embed_query(query)
        
        metadata = {
            "short_description": short_desc,
            "description": desc,
            "priority": priority,
            "resolution": resolution,
            "issue_desc": issue_desc,
            "rca": rca,
            "workaround": workaround,
            "type": "feedback_boost"
        }
        
        self.index.upsert(vectors=[(
            str(uuid.uuid4()), 
            query_vec, 
            metadata
        )])

    def remove_docs(self, doc_ids: List[str]):
        """Removes specific documents from the Pinecone index by their IDs."""
        self.index.delete(ids=doc_ids)

    def generate_answer(self, issue_desc: str, rca: str, resolution: str, workaround: str) -> str:
        """Uses Google Gemini to generate a summary and step-by-step guide from full ticket details."""
        llm = ChatGoogleGenerativeAI(
            model=settings.GOOGLE_MODEL, 
            temperature=0.2,
            google_api_key=settings.GOOGLE_API_KEY
        )
        
        prompt_template = """
        You are an expert IT support assistant. You have been given the details of a closed ticket.
        
        Issue Description:
        {issue_desc}
        
        Root Cause Analysis (RCA):
        {rca}
        
        Resolution Notes:
        {resolution}
        
        Workaround:
        {workaround}
        
        Based ONLY on the provided notes above, please generate:
        1. A brief, 1-2 sentence summary of what the issue was and how it was fixed.
        2. A clear, numbered, step-by-step guide on how to resolve the incident. If the steps are implied rather than stated, deduce the most logical standard steps based on the resolution context.
        """
        
        prompt = PromptTemplate.from_template(prompt_template)
        chain = prompt | llm
        
        response = chain.invoke({
            "issue_desc": issue_desc,
            "rca": rca,
            "resolution": resolution,
            "workaround": workaround
        })
        return response.content