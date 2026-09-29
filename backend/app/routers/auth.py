from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.core.security import verify_password, create_access_token, get_password_hash
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserProfileResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """
    Authenticate resident or administrator.
    Supports:
    - Resident: Flat Number + Phone + Passcode (or demo login)
    - Admin: Email + Master Passkey / Password (or demo login)
    """
    db = get_database()
    user = None
    
    if req.role == "resident":
        # Match resident by flat, phone or email
        # Normalize phone search (strip spaces, +91 etc.)
        query = {"role": "resident"}
        if req.phone:
            raw_phone = req.phone.replace(" ", "").replace("+91", "").replace("-", "")
            # Find matching phone regex
            user = await db.users.find_one({
                "role": "resident",
                "$or": [
                    {"phone": req.phone},
                    {"phone": {"$regex": raw_phone if raw_phone else ".*"}},
                    {"unit": req.flat_number} if req.flat_number else {"_id": {"$exists": True}}
                ]
            })
        if not user and req.flat_number:
            user = await db.users.find_one({
                "role": "resident",
                "unit": {"$regex": req.flat_number.strip(), "$options": "i"}
            })
        if not user:
            # Fallback for demo resident
            user = await db.users.find_one({"role": "resident"})
            
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Resident account not found with the provided details."
            )
            
        # Verify passcode (support default "123456" and masked pin "••••••" or bcrypt hash)
        if req.passcode and req.passcode != "••••••" and req.passcode != "123456":
            if user.get("hashed_password") and not verify_password(req.passcode, user["hashed_password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid passcode or PIN entered."
                )

    elif req.role == "admin":
        email = req.email.strip() if req.email else "admin@mapleheights.org"
        user = await db.users.find_one({"role": "admin", "email": {"$regex": f"^{email}$", "$options": "i"}})
        
        if not user:
            # Fallback admin
            user = await db.users.find_one({"role": "admin"})
            
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Administrator account not found."
            )
            
        # Verify password (support "admin123", "••••••••••••" demo key, or hashed password)
        if req.password and req.password not in ["••••••••••••", "admin123", "admin"]:
            if user.get("hashed_password") and not verify_password(req.password, user["hashed_password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid master security key."
                )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{req.role}'. Must be 'resident' or 'admin'."
        )

    # Generate JWT token
    token_payload = {
        "sub": user["id"],
        "role": user["role"],
        "email": user["email"],
        "name": user["name"],
        "unit": user.get("unit", ""),
    }
    access_token = create_access_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user["role"],
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
        unit=user.get("unit"),
        residency=user.get("residency", "Maple Heights Society"),
        initials=user.get("initials", "SK"),
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Retrieve details of currently logged-in resident or administrator."""
    return UserProfileResponse(
        id=current_user["id"],
        role=current_user["role"],
        name=current_user["name"],
        initials=current_user.get("initials", "SK"),
        residency=current_user.get("residency", "Maple Heights Society"),
        unit=current_user.get("unit", "Tower B · Flat 704"),
        email=current_user["email"],
        phone=current_user["phone"],
        resident_type=current_user.get("resident_type", "Owner Resident"),
        parking_bay=current_user.get("parking_bay", "Bay B-21 (Basement 1)"),
        vehicle_number=current_user.get("vehicle_number", "MH-02-CD-8842"),
        intercom_ext=current_user.get("intercom_ext", "Ext. 704"),
        status=current_user.get("status", "Active"),
    )
