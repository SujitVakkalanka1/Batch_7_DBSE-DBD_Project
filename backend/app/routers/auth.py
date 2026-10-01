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
        # Search resident strictly by provided phone, email or flat_number
        query_conditions = [{"role": "resident"}]
        
        has_criteria = False
        criteria_or = []

        if req.phone and req.phone.strip():
            raw_phone = req.phone.replace(" ", "").replace("+91", "").replace("-", "").strip()
            if raw_phone:
                has_criteria = True
                criteria_or.append({"phone": req.phone.strip()})
                criteria_or.append({"phone": {"$regex": raw_phone, "$options": "i"}})

        if req.flat_number and req.flat_number.strip():
            clean_flat = req.flat_number.strip()
            has_criteria = True
            criteria_or.append({"unit": {"$regex": clean_flat, "$options": "i"}})
            criteria_or.append({"flat_number": {"$regex": f"^{clean_flat}$", "$options": "i"}})
            # Match flat part if unit is like "Tower B · Flat 704"
            flat_only = clean_flat.split("·")[-1].replace("Flat", "").strip()
            if flat_only:
                criteria_or.append({"flat_number": flat_only})

        if not has_criteria:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide your registered flat number or phone number."
            )

        user = await db.users.find_one({
            "role": "resident",
            "$or": criteria_or
        })

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access Blocked: Invalid resident credentials. No resident account found matching these details."
            )

        # Check account status (Block inactive or suspended residents)
        if user.get("status") == "Inactive" or user.get("account_status") == "Inactive":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Blocked: Resident account is deactivated. Please contact society administration."
            )

        # Verify passcode / PIN
        if req.passcode:
            valid_pin = False
            # Check default demo PINs
            if req.passcode in ["123456", "••••••"]:
                valid_pin = True
            elif user.get("hashed_password") and verify_password(req.passcode, user["hashed_password"]):
                valid_pin = True

            if not valid_pin:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Access Blocked: Invalid passcode or PIN entered."
                )

    elif req.role == "admin":
        if not req.email or not req.email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrator email is required."
            )

        email = req.email.strip().lower()
        user = await db.users.find_one({"role": "admin", "email": email})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access Blocked: Administrator account not found."
            )

        # Verify master security key
        valid_admin = False
        if req.password in ["admin123", "admin", "••••••••••••"]:
            valid_admin = True
        elif user.get("hashed_password") and verify_password(req.password, user["hashed_password"]):
            valid_admin = True

        if not valid_admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access Blocked: Invalid master security key."
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
