from typing import Optional
from pydantic import BaseModel, Field

class BookingCreate(BaseModel):
    amenityName: str = Field(..., description="'Clubhouse Banquet' | 'Tennis Court' | 'Swimming Pool' | 'BBQ Gazebo' | 'Conference Room'")
    date: str = Field(..., description="YYYY-MM-DD or readable date")
    timeSlot: str = Field(..., description="e.g. '06:00 PM - 09:00 PM'")

class BookingStatusUpdate(BaseModel):
    status: str = Field(..., description="'Confirmed' | 'Pending' | 'Cancelled'")

class BookingResponse(BaseModel):
    id: str
    amenityName: str
    date: str
    timeSlot: str
    unit: str
    bookedBy: str
    status: str
    amount: str
    created_at: Optional[str] = None
