from typing import Optional, Dict
from pydantic import BaseModel, Field

class PaymentBreakdown(BaseModel):
    maintenance: str = "₹3,500"
    sinkingFund: str = "₹600"
    waterCharges: str = "₹450"
    parkingCharges: str = "₹300"

class PaymentCreate(BaseModel):
    billMonth: str
    amount: str
    dueDate: str
    unit: str
    resident_id: Optional[str] = None
    breakdown: Optional[PaymentBreakdown] = None

class PaymentPayRequest(BaseModel):
    method: str = Field("upi", description="'upi' | 'card' | 'netbanking'")
    upi_id: Optional[str] = None
    card_number: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    billMonth: str
    amount: str
    dueDate: str
    paidDate: Optional[str] = None
    status: str  # 'Paid' | 'Pending' | 'Overdue' | 'Processing' | 'Failed'
    breakdown: PaymentBreakdown
    unit: Optional[str] = None
    resident_name: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_method: Optional[str] = None

class BillGenerationRequest(BaseModel):
    billMonth: str = Field(..., description="e.g. 'October 2026'")
    amount: str = Field("₹4,850")
    dueDate: str = Field("10 Oct 2026")
    breakdown: Optional[PaymentBreakdown] = None
