from typing import Optional
from pydantic import BaseModel

class FlatBase(BaseModel):
    flat_number: str
    tower: str
    floor: int
    occupancy_status: str = "Occupied"  # Occupied, Vacant
    parking_bay: Optional[str] = None
    resident_id: Optional[str] = None

class FlatCreate(FlatBase):
    pass

class FlatResponse(FlatBase):
    id: str
    resident_name: Optional[str] = None
    resident_phone: Optional[str] = None
