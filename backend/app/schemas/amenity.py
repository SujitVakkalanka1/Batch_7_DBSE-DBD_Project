from typing import Optional, List
from pydantic import BaseModel

class AmenityResponse(BaseModel):
    id: str
    name: str
    description: str
    capacity: str
    deposit_amount: str
    is_free: bool
    allowed_slots: List[str]
