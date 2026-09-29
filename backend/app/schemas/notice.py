from typing import Optional
from pydantic import BaseModel, Field

class NoticeCreate(BaseModel):
    title: str = Field(..., min_length=3)
    body: str = Field(..., min_length=5)
    eyebrow: Optional[str] = "BROADCAST · ALL TOWERS"
    priority: Optional[str] = "normal"  # 'normal' | 'urgent'
    target_audience: Optional[str] = "All Residents"
    author: Optional[str] = "Estate Management Office"

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    eyebrow: Optional[str] = None
    priority: Optional[str] = None
    author: Optional[str] = None

class NoticeResponse(BaseModel):
    id: str
    eyebrow: str
    title: str
    body: str
    timestamp: str
    cta: str
    priority: Optional[str] = "normal"
    date: Optional[str] = None
    author: Optional[str] = None
    created_at: Optional[str] = None
