import io
import csv
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from app.db.database import get_database
from app.schemas.payment import (
    PaymentResponse,
    PaymentPayRequest,
    PaymentBreakdown,
    BillGenerationRequest,
    PaymentCreate,
)
from app.services.auth_service import get_current_user, require_resident, require_admin

router = APIRouter(tags=["Payments & Maintenance"])

@router.get("/payments/my", response_model=List[PaymentResponse])
async def get_my_payments(current_user: dict = Depends(require_resident)):
    """Resident: View personal maintenance dues, pending bills and payment history."""
    db = get_database()
    # Find payments linked to this resident's ID or unit
    query = {
        "$or": [
            {"resident_id": current_user["id"]},
            {"unit": current_user.get("unit", "")}
        ]
    }
    cursor = db.payments.find(query).sort("dueDate", -1)
    results = []
    async for p in cursor:
        results.append(PaymentResponse(
            id=p["id"],
            billMonth=p["billMonth"],
            amount=p["amount"],
            dueDate=p["dueDate"],
            paidDate=p.get("paidDate"),
            status=p["status"],
            breakdown=PaymentBreakdown(**p.get("breakdown", {})),
            unit=p.get("unit"),
            resident_name=p.get("resident_name", current_user["name"]),
            transaction_id=p.get("transaction_id"),
            payment_method=p.get("payment_method"),
        ))
    return results

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment_details(payment_id: str, current_user: dict = Depends(get_current_user)):
    """Get details for a specific payment bill."""
    db = get_database()
    p = await db.payments.find_one({"id": payment_id})
    if not p:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    # Check authorization if resident
    if current_user.get("role") == "resident" and p.get("resident_id") != current_user["id"] and p.get("unit") != current_user.get("unit"):
        raise HTTPException(status_code=403, detail="Not authorized to access this payment")

    return PaymentResponse(
        id=p["id"],
        billMonth=p["billMonth"],
        amount=p["amount"],
        dueDate=p["dueDate"],
        paidDate=p.get("paidDate"),
        status=p["status"],
        breakdown=PaymentBreakdown(**p.get("breakdown", {})),
        unit=p.get("unit"),
        resident_name=p.get("resident_name"),
        transaction_id=p.get("transaction_id"),
        payment_method=p.get("payment_method"),
    )

@router.post("/payments/{payment_id}/pay", response_model=PaymentResponse)
async def execute_simulated_payment(
    payment_id: str,
    req: PaymentPayRequest,
    current_user: dict = Depends(require_resident)
):
    """
    Simulated payment execution for academic demonstration.
    Generates realistic transaction reference and updates payment status to Paid.
    """
    db = get_database()
    p = await db.payments.find_one({"id": payment_id})
    if not p:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    if p.get("status") == "Paid":
        raise HTTPException(status_code=400, detail="This bill has already been marked as Paid")

    txn_id = f"TXN-{uuid.uuid4().hex[:9].upper()}"
    today_str = datetime.now().strftime("%d %b %Y")
    
    update_fields = {
        "status": "Paid",
        "paidDate": today_str,
        "transaction_id": txn_id,
        "payment_method": req.method,
        "updated_at": datetime.now().isoformat()
    }
    
    updated = await db.payments.find_one_and_update(
        {"id": payment_id},
        {"$set": update_fields},
        return_document=True
    )

    return PaymentResponse(
        id=updated["id"],
        billMonth=updated["billMonth"],
        amount=updated["amount"],
        dueDate=updated["dueDate"],
        paidDate=updated.get("paidDate"),
        status=updated["status"],
        breakdown=PaymentBreakdown(**updated.get("breakdown", {})),
        unit=updated.get("unit"),
        resident_name=updated.get("resident_name", current_user["name"]),
        transaction_id=txn_id,
        payment_method=req.method,
    )

@router.get("/payments", response_model=List[PaymentResponse])
async def list_all_payments(
    status_filter: Optional[str] = None,
    month_filter: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Admin: View society payment records with filtering."""
    db = get_database()
    query = {}
    if status_filter:
        query["status"] = status_filter
    if month_filter:
        query["billMonth"] = {"$regex": month_filter, "$options": "i"}

    cursor = db.payments.find(query).sort("dueDate", -1)
    results = []
    async for p in cursor:
        results.append(PaymentResponse(
            id=p["id"],
            billMonth=p["billMonth"],
            amount=p["amount"],
            dueDate=p["dueDate"],
            paidDate=p.get("paidDate"),
            status=p["status"],
            breakdown=PaymentBreakdown(**p.get("breakdown", {})),
            unit=p.get("unit"),
            resident_name=p.get("resident_name"),
            transaction_id=p.get("transaction_id"),
            payment_method=p.get("payment_method"),
        ))
    return results

@router.post("/payments/bills", status_code=status.HTTP_201_CREATED)
async def generate_society_bills(
    req: BillGenerationRequest,
    current_user: dict = Depends(require_admin)
):
    """Admin: Batch generate monthly maintenance invoices for all occupied units."""
    db = get_database()
    residents_cursor = db.users.find({"role": "resident"})
    created_count = 0
    default_breakdown = req.breakdown.model_dump() if req.breakdown else {
        "maintenance": "₹3,500",
        "sinkingFund": "₹600",
        "waterCharges": "₹450",
        "parkingCharges": "₹300"
    }

    async for resident in residents_cursor:
        payment_id = f"PAY-{req.billMonth.replace(' ', '-').upper()}-{resident.get('unit', '').split('·')[-1].strip().replace(' ', '')}"
        
        # Check if already generated
        existing = await db.payments.find_one({"id": payment_id})
        if not existing:
            doc = {
                "id": payment_id,
                "billMonth": req.billMonth,
                "amount": req.amount,
                "dueDate": req.dueDate,
                "paidDate": None,
                "status": "Pending",
                "breakdown": default_breakdown,
                "unit": resident.get("unit", ""),
                "resident_id": resident["id"],
                "resident_name": resident["name"],
                "created_at": datetime.now().isoformat()
            }
            await db.payments.insert_one(doc)
            created_count += 1

    return {"message": f"Generated {created_count} maintenance invoices for {req.billMonth}"}

@router.get("/admin/payments/export")
async def export_payments_csv(current_user: dict = Depends(require_admin)):
    """Admin: Export complete society financial ledger as a CSV file."""
    db = get_database()
    cursor = db.payments.find().sort("dueDate", -1)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # CSV Header
    writer.writerow([
        "Invoice ID",
        "Billing Month",
        "Unit / Flat",
        "Resident Name",
        "Amount",
        "Due Date",
        "Status",
        "Payment Date",
        "Transaction ID",
        "Payment Method"
    ])
    
    async for p in cursor:
        writer.writerow([
            p.get("id", ""),
            p.get("billMonth", ""),
            p.get("unit", ""),
            p.get("resident_name", ""),
            p.get("amount", ""),
            p.get("dueDate", ""),
            p.get("status", ""),
            p.get("paidDate", "N/A"),
            p.get("transaction_id", "N/A"),
            p.get("payment_method", "N/A")
        ])
    
    output.seek(0)
    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=society_ledger_{datetime.now().strftime('%Y%m%d')}.csv"
    return response
