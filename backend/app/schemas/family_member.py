from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class FamilyMemberBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    relationship: str = Field(..., description="e.g. 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Other'")
    age: Optional[int] = Field(None, ge=0, le=125)
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    emergency_contact: Optional[bool] = False

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    relationship: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=125)
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    emergency_contact: Optional[bool] = None

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    resident_id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
