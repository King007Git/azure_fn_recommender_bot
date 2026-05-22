import azure.functions as func
import json
import os
from config import settings
from agent.ticket_agent import TicketAgent

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

agent = TicketAgent()

@app.route(route="ingest", methods=["GET"])
async def ingest_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    try:
        await agent.ingest_csv(settings.FILE_PATH)
        return func.HttpResponse("CSV successfully ingested into Pinecone.", status_code=200)
    except Exception as e:
        return func.HttpResponse(f"Ingestion Error: {str(e)}", status_code=500)

@app.route(route="retrieve", methods=["POST"])
def retrieve_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_json = req.get_json()
        query = req_json.get("query")
        
        top_k = req_json.get("top_k", 2)
        threshold = req_json.get("threshold", 0.90) 
        
        results = agent.retrieve(query, top_k, threshold)
        return func.HttpResponse(json.dumps({"data": results}), mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(f"Retrieval Error: {str(e)}", status_code=500)

@app.route(route="feedback", methods=["POST"])
def feedback_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_json = req.get_json()
        query = req_json.get("query")
        short_desc = req_json.get("short_description")
        resolution = req_json.get("resolution")
        
        agent.feedback(query, short_desc, resolution)
        return func.HttpResponse("Feedback processed. Query rank boosted.", status_code=200)
    except Exception as e:
        return func.HttpResponse(f"Feedback Error: {str(e)}", status_code=500)

@app.route(route="remove", methods=["POST"])
def remove_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_json = req.get_json()
        doc_ids = req_json.get("doc_ids")
        
        if not doc_ids or not isinstance(doc_ids, list):
            return func.HttpResponse("Missing or invalid 'doc_ids' list in request.", status_code=400)
            
        agent.remove_docs(doc_ids)
        return func.HttpResponse(f"Successfully removed {len(doc_ids)} documents from Pinecone.", status_code=200)
    except Exception as e:
        return func.HttpResponse(f"Removal Error: {str(e)}", status_code=500)

@app.route(route="generate_answer", methods=["POST"])
def generate_answer_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_json = req.get_json()
        resolution = req_json.get("resolution")
        
        if not resolution:
             return func.HttpResponse("Missing 'resolution' in request.", status_code=400)
             
        answer = agent.generate_answer(resolution)
        return func.HttpResponse(json.dumps({"generative_answer": answer}), mimetype="application/json")
    except Exception as e:
         return func.HttpResponse(f"Generation Error: {str(e)}", status_code=500)