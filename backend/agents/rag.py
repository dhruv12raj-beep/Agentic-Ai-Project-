import requests
import os
import faiss
import numpy as np
from openai import OpenAI

# ── keys from environment (never hardcoded) ───────────────────────────────────
HF_API_KEY   = os.environ["HF_API_KEY"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]

HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"

groq_client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

KNOWLEDGE_BASE = [
    "If a payment was deducted but the order failed, the amount is automatically refunded within 5-7 business days.",
    "To reset a password, click 'Forgot Password' on the login page and follow the email instructions.",
    "If the app is crashing on launch, clear the app cache or reinstall the latest version.",
    "Orders can be cancelled within 30 minutes of placement.",
    "For delivery delays beyond 7 days, the customer is eligible for a full refund or reorder.",
    "Account suspension happens when suspicious activity is detected. Customer must verify identity via email.",
    "If a promo code is not working, it may have expired or already been used.",
    "Product return requests must be raised within 7 days of delivery.",
    "If the wrong item was delivered, raise a ticket with a photo. Replacement dispatched within 2 days.",
    "For billing disputes, the finance team requires the order ID and bank transaction reference.",
]

def get_embeddings(texts: list[str]) -> np.ndarray:
    response = requests.post(
        HF_MODEL_URL,
        headers={"Authorization": f"Bearer {HF_API_KEY}"},
        json={"inputs": texts, "options": {"wait_for_model": True}},
    )
    response.raise_for_status()
    return np.array(response.json(), dtype="float32")

def build_index() -> faiss.IndexFlatL2:
    embeddings = get_embeddings(KNOWLEDGE_BASE)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    return index

index = build_index()

def retrieve_context(query: str, top_k: int = 3) -> list[str]:
    query_vec = get_embeddings([query])
    _, indices = index.search(query_vec, top_k)
    return [KNOWLEDGE_BASE[i] for i in indices[0] if i < len(KNOWLEDGE_BASE)]

def answer(query: str) -> str:
    context = "\n".join(f"- {c}" for c in retrieve_context(query))
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful customer support assistant. "
                    "Answer ONLY using the context below. "
                    "If the answer isn't there, say you don't know.\n\n"
                    f"Context:\n{context}"
                ),
            },
            {"role": "user", "content": query},
        ],
    )
    return response.choices[0].message.content