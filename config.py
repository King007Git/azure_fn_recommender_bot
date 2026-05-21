import os

class Settings:
    def __init__(self):
        self.PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "your-pinecone-api-key")
        self.PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "tickets-index")
        self.EMBEDDING_MODEL = "all-MiniLM-L6-v2"
        self.FILE_PATH = "data/Synthetic_incidents.csv"

settings = Settings()