from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title= "Customer support Agent API",
    description="agentic ai system for handling support tickets",
    version="1.0.0"
)

# for sharing browser sequrity rule 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers= ["*"]
)

 
@app.get("/")
def root():
    return {"message":"customer support agent API is running"}

@app.get("/health")
def health():
    return {"status":"ok"}