from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

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

def build_index():
    embeddings = model.encode(Knowledge_Base, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    return index 

index = build_index()

def retrieve_context(query: str , top_k : int =3)-> list[str]:
    query_vec = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_vec, top_k)
    return [Knowledge_Base[i] for i in indices[0] if i < len(Knowledge_Base)]