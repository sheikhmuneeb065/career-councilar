# backend/schemas.py
from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    # accept either `user_id` or `user` from frontend for compatibility
    user_id: Optional[str] = None
    user: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    # frontend expects a `response` field
    response: str
