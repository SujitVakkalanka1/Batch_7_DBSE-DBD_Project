from typing import Optional
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    role: str = Field(..., description="Role: 'resident' or 'admin'")
    # Resident login fields:
    flat_number: Optional[str] = Field(None, description="Flat number e.g. 'Tower B · 704'")
    phone: Optional[str] = Field(None, description="Registered phone number")
    passcode: Optional[str] = Field(None, description="6-digit PIN or password")
    # Admin login fields / Email login:
    email: Optional[str] = Field(None, description="Email address")
    password: Optional[str] = Field(None, description="Password or passkey")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str
    email: str
    unit: Optional[str] = None
    residency: Optional[str] = None
    initials: Optional[str] = None

class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
