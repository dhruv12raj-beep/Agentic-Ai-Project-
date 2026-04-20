import numpy as np
import faiss
from groq import Groq
from config import GROQ_API_KEY


client = Groq(api_key=GROQ_API_KEY)

EMBEDDING_MODEL = "nomic-embed-text-v1.5"  

Knowledge_Base = [
    "If a payment was deducted but the order failed, the amount is automatically refunded within 5-7 business days. Customer should check their bank statement.",
    "To reset a password, the customer should click 'Forgot Password' on the login page and follow the email instructions.",
    "If the app is crashing on launch, the customer should clear the app cache or reinstall the latest version.",
    "Orders can be cancelled within 30 minutes of placement. After that, cancellation is not possible.",
    "For delivery delays beyond 7 days, the customer is eligible for a full refund or reorder at no extra charge.",
    "Account suspension happens when suspicious activity is detected. Customer must verify identity via email to reactivate.",
    "If a promo code is not working, it may have expired or already been used. Only one promo code is allowed per order.",
    "Product return requests must be raised within 7 days of delivery. The item must be unused and in original packaging.",
    "If the wrong item was delivered, the customer should raise a ticket with a photo. Replacement is dispatched within 2 days.",
    "For billing disputes, the finance team requires the order ID and bank transaction reference to investigate.",
]

_index = None


def _embed(texts: list[str]) -> np.ndarray:
    """Call Groq embeddings API and return numpy array."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    return np.array([item.embedding for item in response.data], dtype=np.float32)


def _get_index() -> faiss.IndexFlatL2:
    """Build FAISS index on first use."""
    global _index
    if _index is None:
        kb_embeddings = _embed(Knowledge_Base)
        _index = faiss.IndexFlatL2(kb_embeddings.shape[1])
        _index.add(kb_embeddings)
    return _index


def retrieve_context(query: str, top_k: int = 3) -> list[str]:
    index = _get_index()
    query_vec = _embed([query])
    distances, indices = index.search(query_vec, top_k)
    return [Knowledge_Base[i] for i in indices[0] if i < len(Knowledge_Base)]