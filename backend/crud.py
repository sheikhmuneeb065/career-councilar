from typing import List, Dict
from database import USE_FIRESTORE, db, read_local_store, write_local_store
from pathlib import Path
import time


def save_chat(user_id: str, message: str, reply: str) -> Dict:
    """Save a chat message. Returns the saved record (with an id if available)."""
    timestamp = int(time.time())
    record = {"message": message, "reply": reply, "timestamp": timestamp}

    if USE_FIRESTORE and db is not None:
        # Firestore structure: collection('chats') / doc(user_id) / collection('messages')
        chat_ref = db.collection("chats").document(user_id).collection("messages")
        doc_ref = chat_ref.document()
        doc_ref.set(record)
        record["id"] = doc_ref.id
        return record

    # Local JSON fallback
    store = read_local_store()
    if "chats" not in store:
        store["chats"] = {}
    if user_id not in store["chats"]:
        store["chats"][user_id] = []
    # create a simple incremental id
    rid = f"local-{int(time.time()*1000)}"
    record["id"] = rid
    store["chats"][user_id].append(record)
    write_local_store(store)
    return record


def get_chat_history(user_id: str) -> List[Dict]:
    if USE_FIRESTORE and db is not None:
        chat_ref = db.collection("chats").document(user_id).collection("messages")
        docs = chat_ref.stream()
        history = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            history.append(d)
        # sort by timestamp if present
        history.sort(key=lambda x: x.get("timestamp", 0))
        return history

    # Local JSON fallback
    store = read_local_store()
    return store.get("chats", {}).get(user_id, [])

