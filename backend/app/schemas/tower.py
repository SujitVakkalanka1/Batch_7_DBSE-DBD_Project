from typing import Optional, List
from pydantic import BaseModel, Field

class TowerBase(BaseModel):
    name: str = Field(..., description="Tower name, e.g. 'Tower A' or 'Tower D'")
    total_flats: int = Field(84, description="Total units / capacity in this tower", ge=1)
    floor_count: Optional[int] = Field(14, description="Total floors in this tower", ge=1)
    description: Optional[str] = Field("", description="Optional notes or details about the tower")

class TowerCreate(TowerBase):
    pass

class TowerUpdate(BaseModel):
    name: Optional[str] = None
    total_flats: Optional[int] = Field(None, ge=1)
    floor_count: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None

class TowerResponse(TowerBase):
    id: str
    occupied_flats: int = 0
    vacant_flats: int = 0
    occupancy_rate: str = "0%"
    vacancy_rate: str = "100%"

class TransferResidentRequest(BaseModel):
    resident_id: str
    target_tower: str
    target_flat: Optional[str] = None
    target_parking: Optional[str] = None
