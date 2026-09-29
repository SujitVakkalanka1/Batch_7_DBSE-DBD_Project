from typing import Optional
from pydantic import BaseModel, Field

class GatePassCreate(BaseModel):
    visitorName: str = Field(..., min_length=2)
    visitorPhone: Optional[str] = None
    purpose: str = Field("Guest", description="'Guest' | 'Delivery' | 'Cab' | 'Service Provider'")
    validDate: Optional[str] = "Today"

class GatePassStatusUpdate(BaseModel):
    status: str = Field(..., description="'Active' | 'Used' | 'Expired'")

class GatePassResponse(BaseModel):
    id: str
    visitorName: str
    visitorPhone: str
    purpose: str
    unit: str
    validDate: str
    validTime: str
    passCode: str
    status: str
    created_at: Optional[str] = None
