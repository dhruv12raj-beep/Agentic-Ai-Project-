from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth , tickets , executive

app = FastAPI(
    title= "Customer support Agent API",
    description="agentic ai system for handling support tickets",
    version="1.0.0"
)

# for sharing browser security rule 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers= ["*"]
)

app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(executive.router)


@app.get("/")
def root():
    return {"message":"customer support agent API is running"}

@app.get("/health")
def health():
    return {"status":"ok"}