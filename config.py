import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Settings:
    def __init__(self):
        self.PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "pinecone-api-key")
        self.PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "tickets-index")
        self.GOOGLE_API_KEY = os.getenv("GOOGLE_GENAI_KEY", "google-genai-key")
        self.EMBEDDING_MODEL = os.path.join(BASE_DIR, "model", "all-MiniLM-L6-v2")
        self.GOOGLE_MODEL = "gemini-3-flash-preview"
        self.FILE_PATH = "data/Synthetic_incidents.csv"

settings = Settings()