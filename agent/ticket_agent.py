import uuid
import asyncio
import pandas as pd
from typing import TypedDict, List, Dict, Any
from pinecone import Pinecone
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langgraph.graph import StateGraph, START, END

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
        
        # Initialize Gemini Model
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GOOGLE_MODEL, 
            api_key=settings.GOOGLE_API_KEY,
            temperature=0.2 # Low temperature for factual summarization
        )
        
        # Build LangGraph for Retrieval Workflow
        workflow = StateGraph(GraphState)
        workflow.add_node("retrieve", self._retrieve_node)
        workflow.add_node("summarize", self._summarize_node)
        
        # Define the flow: START -> retrieve -> summarize -> END
        workflow.add_edge(START, "retrieve")
        workflow.add_edge("retrieve", "summarize")
        workflow.add_edge("summarize", END)
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
                    "score": match["score"],
                    "short_description": match["metadata"].get("short_description", ""),
                    "resolution": match["metadata"].get("resolution", "")
                })
        return {"results": valid_matches}

    def _summarize_node(self, state: GraphState) -> Dict:
        """LangGraph node to summarize the retrieved resolutions using Gemini."""
        results = state.get("results", [])
        if not results:
            return {"results": []} 
        
        prompt = PromptTemplate.from_template(
            "You are an expert IT support assistant. Summarize the following IT resolution "
            "into a concise, clear, and actionable step or short paragraph. "
            "Remove unnecessary filler words like 'Root Cause Category' or 'Event Description'.\n\n"
            "Original Resolution:\n{resolution}"
        )
        
        chain = prompt | self.llm
        batch_inputs = [{"resolution": r["resolution"]} for r in results]
        
        try:
            llm_responses = chain.batch(batch_inputs)
            
            for idx, response in enumerate(llm_responses):
                # Ensure we handle LangChain's AIMessage object correctly
                if hasattr(response, 'content'):
                    # If content is a string
                    if isinstance(response.content, str):
                        summary = response.content.strip()
                    # If content is a list (sometimes happens with newer Gemini tool-calling formats)
                    elif isinstance(response.content, list):
                        summary = " ".join([item.get("text", "") for item in response.content if item.get("type") == "text"]).strip()
                    else:
                        summary = str(response.content).strip()
                else:
                    summary = str(response).strip()
                    
                results[idx]["resolution"] = summary
                
        except Exception as e:
            # Raise the exception so LangGraph/Azure can catch it and report it to the user
            raise Exception(f"Failed to summarize with GenAI: {str(e)}")
        
        return {"results": results}
    
    async def ingest_csv(self, file_path: str):
        """Asynchronously read CSV and upload vectors in batches."""
        loop = asyncio.get_event_loop()
        
        def read_data():
            return pd.read_csv(file_path, encoding='latin1', encoding_errors='replace')
        df = await loop.run_in_executor(None, read_data)
        
        batch_size = 100
        vectors = []
        
        for _, row in df.iterrows():
            text_to_embed = str(row['Short description'])
            metadata = {
                "short_description": text_to_embed,
                "resolution": str(row.get('Resolution Note', ''))
            }
            vectors.append({"id": str(uuid.uuid4()), "text": text_to_embed, "metadata": metadata})
            
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i+batch_size]
            texts = [v["text"] for v in batch]
            embs = self.embeddings.embed_documents(texts)
            
            upsert_data = [(v["id"], embs[j], v["metadata"]) for j, v in enumerate(batch)]
            self.index.upsert(vectors=upsert_data)

    def retrieve(self, query: str, top_k: int, threshold: float) -> List:
        initial_state = {"query": query, "top_k": top_k, "threshold": threshold, "results": []}
        result = self.app.invoke(initial_state)
        return result["results"]

    def feedback(self, query: str, ticket_description: str, resolution: str):
        """Embeds the user's specific phrase to guarantee a future match."""
        query_vec = self.embeddings.embed_query(query)
        self.index.upsert(vectors=[(
            str(uuid.uuid4()), 
            query_vec, 
            {"short_description": ticket_description, "resolution": resolution, "type": "feedback_boost"}
        )])