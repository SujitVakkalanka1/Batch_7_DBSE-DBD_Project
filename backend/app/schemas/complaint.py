from typing import Optional
from pydantic import BaseModel, Field

class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    category: str = Field("Plumbing", description="'Plumbing' | 'Electrical' | 'Parking' | 'Lift / Common Area' | 'Security' | 'Other'")
    urgency: str = Field("Medium", description="'Low' | 'Medium' | 'High'")
    description: str = Field(..., min_length=5)

class ComplaintStatusUpdate(BaseModel):
    status: str = Field(..., description="'Pending' | 'In Progress' | 'Resolved'")
    resolution_notes: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: str
    title: str
    category: str
    status: str
    unit: str
    submittedBy: str
    date: str
    urgency: str
    description: str
    resolution_notes: Optional[str] = None
