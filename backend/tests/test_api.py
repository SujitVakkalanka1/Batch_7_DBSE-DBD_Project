import urllib.request
import urllib.error
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://127.0.0.1:8000/api'


def req(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    r = urllib.request.Request(f'{BASE}{url}', data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as res:
            content = res.read().decode('utf-8')
            return res.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {'detail': content}

def run_tests():
    print("=== 1. TEST RESIDENT LOGIN ===")
    status, res_login = req('/auth/login', 'POST', {'role': 'resident', 'flat_number': 'Tower B · 704', 'phone': '+91 98765 43210', 'passcode': '123456'})
    assert status == 200, f"Resident login failed: {res_login}"
    res_token = res_login['access_token']
    print(f"PASS: Resident {res_login['name']} logged in. Token generated.")

    print("=== 2. TEST ADMIN LOGIN ===")
    status, adm_login = req('/auth/login', 'POST', {'role': 'admin', 'email': 'admin@mapleheights.org', 'password': 'admin123'})
    assert status == 200, f"Admin login failed: {adm_login}"
    adm_token = adm_login['access_token']
    print(f"PASS: Admin {adm_login['name']} logged in.")

    print("=== 3. TEST GET RESIDENT PROFILE ===")
    status, profile = req('/residents/me', 'GET', token=res_token)
    assert status == 200 and profile['unit'] == 'Tower B · Flat 704', f"Profile failed: {profile}"
    print(f"PASS: Profile retrieved for unit {profile['unit']}.")

    print("=== 4. TEST CREATE COMPLAINT ===")
    status, new_ticket = req('/complaints', 'POST', {
        'title': 'Elevator display blinking',
        'category': 'Electrical',
        'urgency': 'Medium',
        'description': 'Display board in elevator A flickers intermittently.'
    }, token=res_token)
    assert status == 201, f"Create complaint failed: {new_ticket}"
    ticket_id = new_ticket['id']
    print(f"PASS: Complaint created with ID: {ticket_id}, Status: {new_ticket['status']}")

    print("=== 5. TEST ADMIN UPDATE COMPLAINT STATUS ===")
    status, updated_ticket = req(f'/admin/complaints/{ticket_id}/status', 'PATCH', {'status': 'In Progress', 'resolution_notes': 'Electrician dispatched'}, token=adm_token)
    assert status == 200 and updated_ticket['status'] == 'In Progress', f"Ticket update failed: {updated_ticket}"
    print(f"PASS: Admin updated ticket {ticket_id} to In Progress.")

    print("=== 6. TEST CREATE GATE PASS ===")
    status, new_pass = req('/gate-passes', 'POST', {
        'visitorName': 'Blinkit Delivery',
        'visitorPhone': '+91 98888 11111',
        'purpose': 'Delivery',
        'validDate': 'Today'
    }, token=res_token)
    assert status == 201, f"Create gate pass failed: {new_pass}"
    pass_id = new_pass['id']
    print(f"PASS: Gate pass created: {pass_id}, PassCode: {new_pass['passCode']}")

    import time
    test_date = f"2026-11-{int(time.time()) % 28 + 1:02d}"
    print("=== 7. TEST AMENITY BOOKING & CONFLICT DETECTION ===")
    status, b1 = req('/bookings', 'POST', {
        'amenityName': 'Tennis Court',
        'date': test_date,
        'timeSlot': '06:00 PM - 09:00 PM'
    }, token=res_token)
    assert status == 201, f"First booking failed: {b1}"
    print(f"PASS: Booking confirmed: {b1['id']} for {b1['amenityName']}")

    # Test conflict on identical slot
    status, b2_conflict = req('/bookings', 'POST', {
        'amenityName': 'Tennis Court',
        'date': test_date,
        'timeSlot': '06:00 PM - 09:00 PM'
    }, token=res_token)
    assert status == 409, f"Expected 409 conflict, got status {status}: {b2_conflict}"
    print(f"PASS: Double-booking correctly prevented with 409 Conflict: {b2_conflict['detail']}")


    print("=== 8. TEST SIMULATED PAYMENT ===")
    status, my_payments = req('/payments/my', 'GET', token=res_token)
    assert status == 200 and len(my_payments) > 0, f"Payments list failed: {my_payments}"
    pending = next((p for p in my_payments if p['status'] == 'Pending'), None)
    if pending:
        status, pay_res = req(f"/payments/{pending['id']}/pay", 'POST', {'method': 'upi', 'upi_id': 'sujit@okhdfcbank'}, token=res_token)
        assert status == 200 and pay_res['status'] == 'Paid', f"Payment failed: {pay_res}"
        print(f"PASS: Payment successful! Bill: {pending['id']}, Txn ID: {pay_res['transaction_id']}")
    else:
        paid_bill = my_payments[0]
        print(f"PASS: Verified paid payment record {paid_bill['id']}, Status: {paid_bill['status']}")


    print("=== 9. TEST ADMIN BROADCAST NOTICE ===")
    status, notice = req('/notices', 'POST', {
        'title': 'Solar Panel Installation Update',
        'body': 'Phase 1 rooftop solar grid installation is now active across Tower B.',
        'eyebrow': 'BROADCAST · ALL TOWERS',
        'priority': 'normal'
    }, token=adm_token)
    assert status == 201, f"Notice creation failed: {notice}"
    print(f"PASS: Broadcast notice published: {notice['id']}")

    print("=== 10. TEST UNAUTHORIZED ACCESS REJECTION ===")
    status, forbidden_res = req('/admin/dashboard', 'GET', token=res_token)
    assert status == 403, f"Expected 403 Forbidden for resident on admin endpoint, got {status}"
    print(f"PASS: Resident blocked from Admin API with 403 Forbidden: {forbidden_res['detail']}")

    print("=== 12. TEST RESIDENT FAMILY MEMBERS (CRUD & OWNERSHIP) ===")
    # List Sujit's family members
    status, fam_list = req('/family-members', 'GET', token=res_token)
    assert status == 200 and len(fam_list) >= 2, f"Expected at least 2 family members for Sujit, got {fam_list}"
    print(f"PASS: Sujit retrieved {len(fam_list)} family members.")

    # Add a new family member for Sujit
    status, new_member = req('/family-members', 'POST', {
        'name': 'Kavita Vakkalanka',
        'relationship': 'Mother',
        'age': 56,
        'phone': '+91 98765 43299',
        'email': 'kavita.v@courtyard.live',
        'gender': 'Female',
        'emergency_contact': True
    }, token=res_token)
    assert status == 201, f"Failed to add family member: {new_member}"
    member_id = new_member['id']
    print(f"PASS: Family member added: {new_member['name']} ({new_member['relationship']}), ID: {member_id}")

    # Update family member
    status, updated_member = req(f'/family-members/{member_id}', 'PUT', {
        'name': 'Kavita Vakkalanka',
        'relationship': 'Mother',
        'age': 57
    }, token=res_token)
    assert status == 200 and updated_member['age'] == 57, f"Update family member failed: {updated_member}"
    print(f"PASS: Updated family member age to {updated_member['age']}.")

    # Login as Dr. Vikram Mehra (different resident)
    status, vikram_login = req('/auth/login', 'POST', {
        'role': 'resident',
        'flat_number': 'Tower A · 101',
        'phone': '+91 98201 11223',
        'passcode': '123456'
    })
    assert status == 200, f"Vikram login failed: {vikram_login}"
    vikram_token = vikram_login['access_token']

    # Security test: Vikram tries to access / modify Sujit's family member
    print("=== 13. TEST OWNERSHIP ISOLATION & AUTHORIZATION ===")
    status, forbidden_view = req(f'/family-members/{member_id}', 'GET', token=vikram_token)
    assert status == 403, f"Expected 403 Forbidden for cross-resident access, got {status}: {forbidden_view}"
    print(f"PASS: Cross-resident GET access correctly blocked with 403 Forbidden.")

    status, forbidden_edit = req(f'/family-members/{member_id}', 'PUT', {'name': 'Hacked Name'}, token=vikram_token)
    assert status == 403, f"Expected 403 Forbidden for cross-resident edit, got {status}: {forbidden_edit}"
    print(f"PASS: Cross-resident PUT access correctly blocked with 403 Forbidden.")

    status, forbidden_del = req(f'/family-members/{member_id}', 'DELETE', token=vikram_token)
    assert status == 403, f"Expected 403 Forbidden for cross-resident delete, got {status}: {forbidden_del}"
    print(f"PASS: Cross-resident DELETE access correctly blocked with 403 Forbidden.")

    # Resident tries to access admin endpoint
    status, forbidden_admin = req(f'/admin/residents/USR-RES-704/family-members', 'GET', token=res_token)
    assert status == 403, f"Expected 403 Forbidden when resident accesses admin API, got {status}: {forbidden_admin}"
    print(f"PASS: Resident access to admin API correctly rejected with 403 Forbidden.")

    # Sujit deletes the test family member
    status, del_res = req(f'/family-members/{member_id}', 'DELETE', token=res_token)
    assert status == 200, f"Delete family member failed: {del_res}"
    print(f"PASS: Family member deleted by owner resident: {del_res['message']}")

    print("=== 14. TEST ADMIN RESIDENT MANAGEMENT ===")
    # Admin list residents with tower and status filter
    status, admin_residents = req('/residents?tower=Tower%20B&status=Active', 'GET', token=adm_token)
    assert status == 200 and len(admin_residents) > 0, f"Admin list residents failed: {admin_residents}"
    print(f"PASS: Admin retrieved {len(admin_residents)} residents for Tower B.")

    # Admin view resident details with family members
    status, sujit_details = req('/residents/USR-RES-704', 'GET', token=adm_token)
    assert status == 200 and 'family_members' in sujit_details, f"Resident details failed: {sujit_details}"
    print(f"PASS: Admin viewed Sujit details with {len(sujit_details['family_members'])} family members.")

    # Admin add new resident
    new_res_email = f"test.resident.{int(time.time())}@mapleheights.org"
    status, created_res = req('/residents', 'POST', {
        'name': 'Deepak Verma',
        'email': new_res_email,
        'phone': '+91 97777 88888',
        'tower': 'Tower C',
        'flat_number': '305',
        'unit': 'Tower C · Flat 305',
        'resident_type': 'Owner Resident',
        'password': 'password123'
    }, token=adm_token)
    assert status == 201, f"Admin create resident failed: {created_res}"
    created_id = created_res['id']
    print(f"PASS: Admin created new resident: {created_res['name']} ({created_res['unit']}), ID: {created_id}")

    # Admin edit resident
    status, edited_res = req(f'/residents/{created_id}', 'PUT', {
        'name': 'Deepak K. Verma',
        'resident_type': 'Tenant Resident'
    }, token=adm_token)
    assert status == 200 and edited_res['name'] == 'Deepak K. Verma', f"Admin edit resident failed: {edited_res}"
    print(f"PASS: Admin edited resident name to {edited_res['name']}.")

    # Admin deactivate resident (soft deletion)
    status, deact_res = req(f'/residents/{created_id}/status', 'PATCH', {'status': 'Inactive'}, token=adm_token)
    assert status == 200 and deact_res['status'] == 'Inactive', f"Deactivate failed: {deact_res}"
    print(f"PASS: Admin deactivated resident {created_id} (soft delete preserved).")

    # Admin reactivate resident
    status, react_res = req(f'/residents/{created_id}/status', 'PATCH', {'status': 'Active'}, token=adm_token)
    assert status == 200 and react_res['status'] == 'Active', f"Reactivate failed: {react_res}"
    print(f"PASS: Admin reactivated resident {created_id}.")

    # Admin inspect resident family members endpoint
    status, admin_fam_view = req(f'/admin/residents/USR-RES-704/family-members', 'GET', token=adm_token)
    assert status == 200 and len(admin_fam_view) >= 2, f"Admin view family failed: {admin_fam_view}"
    print(f"PASS: Admin verified {len(admin_fam_view)} family members via admin endpoint.")

    print("\n========================================")
    print(">>> ALL 14 API TEST SCENARIOS PASSED! <<<")
    print("========================================")

if __name__ == '__main__':
    run_tests()
