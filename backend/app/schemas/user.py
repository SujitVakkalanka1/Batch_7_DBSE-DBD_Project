from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.schemas.family_member import FamilyMemberResponse

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str = Field("resident", description="'resident' or 'admin'")
    unit: Optional[str] = Field(None, description="e.g. Tower B · Flat 704")
    tower: Optional[str] = Field(None, description="e.g. Tower A, Tower B, Tower C")
    flat_number: Optional[str] = Field(None, description="e.g. 704 or B-704")
    residency: Optional[str] = "Maple Heights Society"
    initials: Optional[str] = None
    resident_type: Optional[str] = "Owner Resident"
    parking_bay: Optional[str] = None
    vehicle_number: Optional[str] = None
    intercom_ext: Optional[str] = None
    status: Optional[str] = "Active"

class UserCreate(UserBase):
    password: Optional[str] = "123456"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    unit: Optional[str] = None
    tower: Optional[str] = None
    flat_number: Optional[str] = None
    resident_type: Optional[str] = None
    parking_bay: Optional[str] = None
    vehicle_number: Optional[str] = None
    intercom_ext: Optional[str] = None
    status: Optional[str] = None

class ResidentStatusUpdate(BaseModel):
    status: str = Field(..., description="'Active' or 'Inactive'")

class UserProfileResponse(BaseModel):
    id: str
    role: str
    name: str
    initials: str
    residency: str
    unit: str
    email: str
    phone: str
    tower: Optional[str] = None
    flat_number: Optional[str] = None
    resident_type: Optional[str] = "Owner Resident"
    parking_bay: Optional[str] = "Bay B-21 (Basement 1)"
    vehicle_number: Optional[str] = "MH-02-CD-8842"
    intercom_ext: Optional[str] = "Ext. 704"
    status: Optional[str] = "Active"

class ResidentDirectoryItem(BaseModel):
    id: str
    unit: str
    name: str
    phone: str
    status: str
    email: Optional[str] = None
    tower: Optional[str] = None
    flat_number: Optional[str] = None
    resident_type: Optional[str] = "Owner Resident"
    account_status: str = "Active"
    family_count: int = 0

class ResidentDetailResponse(UserProfileResponse):
    family_members: List[FamilyMemberResponse] = []
    dues_status: Optional[str] = "Dues Cleared"
