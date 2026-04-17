from dotenv import load_dotenv
import os 

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
POSTGRES_URL = os.getenv("POSTGRES_URL")
MONGO_URL = os.getenv("MONGO_URL")