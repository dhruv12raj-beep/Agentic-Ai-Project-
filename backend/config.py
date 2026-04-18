from dotenv import load_dotenv
import os 

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
POSTGRES_URL = os.getenv("POSTGRES_URL")
MONGO_URL = os.getenv("MONGO_URL")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRY_MINUTES = int(os.getenv("JWT_EXPIRY_MINUTES", 60))

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")