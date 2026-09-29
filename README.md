# 🏢 The Society / Apartment Management Portal

A full-stack, enterprise-grade web application designed for comprehensive residential society and apartment community management. Built with **React.js**, **FastAPI (Python)**, and **MongoDB (Motor Async)** with **JWT Authentication**.

---

## 📌 Project Overview

The **Society / Apartment Management Portal** provides a centralized platform for both residents and estate administrators. It streamlines everyday housing society operations including resident unit directories, maintenance dues billing and online simulated settlements, facility ticketing and complaint resolution, contactless QR visitor gate-passes, amenity slot reservation with conflict detection, official noticeboard broadcasts, and administrative analytics.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Python 3.14 / 3.11+, FastAPI, Uvicorn |
| **Database** | MongoDB (Local / Atlas) |
| **Async Driver / ODM** | Motor (AsyncIOMotorClient), PyMongo |
| **Security & Auth** | JWT (python-jose), Password Hashing (bcrypt) |
| **API Documentation** | OpenAPI 3.0, Swagger UI, ReDoc |
| **API Testing** | Postman Collection (`postman_collection.json`) |

---

## 📁 Repository Structure

```text
Batch_7_DBSE-DBD_Project/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, lifespan, CORS & router registration
│   │   ├── core/
│   │   │   ├── config.py            # Environment configuration with Pydantic settings
│   │   │   └── security.py          # Bcrypt hashing & JWT token management
│   │   ├── db/
│   │   │   ├── database.py          # Async Motor MongoDB connection & index initialization
│   │   │   └── seed.py              # Realistic demo seed script for all collections
│   │   ├── schemas/                 # Pydantic request/response models & validation
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── flat.py
│   │   │   ├── payment.py
│   │   │   ├── complaint.py
│   │   │   ├── gate_pass.py
│   │   │   ├── amenity.py
│   │   │   ├── booking.py
│   │   │   ├── notice.py
│   │   │   └── admin.py
│   │   ├── routers/                 # Modular API endpoints
│   │   │   ├── auth.py
│   │   │   ├── residents.py
│   │   │   ├── flats.py
│   │   │   ├── payments.py
│   │   │   ├── complaints.py
│   │   │   ├── gate_passes.py
│   │   │   ├── amenities.py
│   │   │   ├── bookings.py
│   │   │   ├── notices.py
│   │   │   └── admin.py
│   │   └── services/
│   │       └── auth_service.py      # RBAC token verification & role dependencies
│   ├── requirements.txt             # Python backend dependencies
│   ├── .env.example                 # Environment configuration template
│   └── .env                         # Active backend environment configuration
├── frontend/                        # React Frontend Application
│   ├── client/
│   │   └── src/
│   │       ├── api/                 # Centralized Axios API service layer
│   │       │   ├── apiClient.ts
│   │       │   ├── auth.ts
│   │       │   ├── residents.ts
│   │       │   ├── payments.ts
│   │       │   ├── complaints.ts
│   │       │   ├── gatePasses.ts
│   │       │   ├── amenities.ts
│   │       │   ├── bookings.ts
│   │       │   ├── notices.ts
│   │       │   ├── admin.ts
│   │       │   └── index.ts
│   │       ├── components/
│   │       │   ├── admin/           # Admin Dashboard & operations desk
│   │       │   ├── auth/            # Authentication Gateway
│   │       │   ├── common/          # Brand Logo & shared elements
│   │       │   ├── modals/          # Payment, Complaint, Gate-pass, Amenity & Notice modals
│   │       │   ├── navigation/      # Floating Bottom Navigation Dock
│   │       │   └── resident/        # Resident Dashboard & activity canvas
│   │       ├── types/portal.ts      # TypeScript interfaces
│   │       └── App.tsx              # Root session coordinator
│   ├── package.json
│   └── vite.config.ts
├── postman_collection.json          # Pre-configured Postman testing collection
└── README.md
```

---

## ⚙️ Prerequisites

1. **Python 3.10+** (Python 3.14 supported)
2. **Node.js 18+** and **pnpm** (or `npm`)
3. **MongoDB** running locally on port `27017` or MongoDB Atlas URI

---

## 🗄️ MongoDB Setup

1. Make sure MongoDB service is active.
   - On Windows: Check via Services or run `net start MongoDB`.
2. Default connection string: `mongodb://localhost:27017`.
3. Database name: `society_portal`.

---

## 🔐 Environment Variables

Create `backend/.env` (or copy from `backend/.env.example`):

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=society_portal
SECRET_KEY=maple-heights-super-secret-jwt-key-2026-secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173
PROJECT_NAME=Society & Apartment Management Portal
API_V1_STR=/api
ENVIRONMENT=development
```

---

## 🚀 Step-by-Step Installation & Running

### 1. Backend Setup & Seeding

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed database with realistic initial records
python -m app.db.seed

# 4. Start the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be active at: **`http://127.0.0.1:8000`**
Interactive Swagger Documentation: **`http://127.0.0.1:8000/docs`**

---

### 2. Frontend Setup & Launch

```bash
# 1. In a new terminal, navigate to frontend directory
cd frontend

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev
```

Frontend will open at: **`http://localhost:5173`**

---

## 🔑 Demo Credentials

| Role | Login Identifier | Passcode / Key | Quick Action |
| :--- | :--- | :--- | :--- |
| **Resident** | Flat: `Tower B · 704`<br>Phone: `+91 98765 43210` | PIN: `123456` (or `••••••`) | Click **Resident Demo** button on login screen |
| **Admin** | Email: `admin@mapleheights.org` | Passkey: `admin123` (or `••••••••••••`) | Click **Admin Demo** button on login screen |

---

## 🌐 API Overview & Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login` — Resident & Admin JWT authentication
- `GET /api/auth/me` — Active session profile retrieval

### 2. Resident & Flat Management (`/api/residents`, `/api/flats`)
- `GET /api/residents/me` — Authenticated resident details
- `GET /api/residents` — Admin: Complete directory of society occupants
- `POST /api/residents` — Admin: Add resident
- `PUT /api/residents/{id}` — Admin: Edit resident details
- `DELETE /api/residents/{id}` — Admin: Remove resident
- `GET /api/flats` — Flat occupancy & parking bay registry
- `GET /api/flats/{flat_number}` — Unit details

### 3. Maintenance & Payments (`/api/payments`, `/api/admin/payments`)
- `GET /api/payments/my` — Resident maintenance bills & payment history
- `GET /api/payments/{id}` — Invoice breakdown
- `POST /api/payments/{id}/pay` — Safe simulated payment gateway (UPI/Card/NetBanking) with transaction ID generation
- `GET /api/payments` — Admin: Society payment logs
- `POST /api/payments/bills` — Admin: Batch generate monthly invoices
- `GET /api/admin/payments/export` — Admin: Download society ledger as CSV

### 4. Complaints & Helpdesk (`/api/complaints`, `/api/admin/complaints`)
- `POST /api/complaints` — Resident: Raise maintenance complaint (Plumbing, Electrical, Lifts, etc.)
- `GET /api/complaints/my` — Resident: View complaint ticket history
- `GET /api/admin/complaints` — Admin: View all tickets with category/status filters
- `PATCH /api/admin/complaints/{id}/status` — Admin: Transition ticket status (`Pending` ➔ `In Progress` ➔ `Resolved`)

### 5. Visitor Gate Passes (`/api/gate-passes`, `/api/admin/gate-passes`)
- `POST /api/gate-passes` — Resident: Authoritative gate-pass creation with backend passcode generation
- `GET /api/gate-passes/my` — Resident: Active & past entry passes
- `GET /api/admin/gate-passes` — Gate Command: Visitor logs
- `PATCH /api/admin/gate-passes/{id}/status` — Gate Command: Mark pass as `Used` / `Expired`

### 6. Amenities & Reservations (`/api/amenities`, `/api/bookings`, `/api/admin/bookings`)
- `GET /api/amenities` — List facilities (Clubhouse Banquet, Tennis Court, Pool, Gazebo, Conference Room)
- `POST /api/bookings` — Resident: Reserve amenity (Backend conflict validation prevents double-booking)
- `GET /api/bookings/my` — Resident: Booking history
- `GET /api/admin/bookings` — Admin: Facility reservations schedule
- `PATCH /api/admin/bookings/{id}/status` — Admin: Update booking status

### 7. Notices & Announcements (`/api/notices`)
- `GET /api/notices` — Official digital noticeboard announcements
- `POST /api/notices` — Admin: Publish broadcast notices and urgent alerts
- `PUT /api/notices/{id}` — Admin: Edit announcement
- `DELETE /api/notices/{id}` — Admin: Remove announcement

### 8. Admin Operations Analytics (`/api/admin/dashboard`)
- `GET /api/admin/dashboard` — Aggregated metrics: collection efficiency, total dues, occupied flats, open tickets, active gate passes

---

## 🧪 Testing with Postman

1. Open Postman.
2. Click **Import** ➔ select `postman_collection.json` located at the root of the project.
3. The collection is organized into 8 functional folders covering all API endpoints.
4. Run `01. Authentication / Resident Login` or `Admin Login` to test token generation, then execute downstream endpoints.

---

## 📜 Academic Project Information
- **Course**: Database Systems Engineering & Distributed Backend Development (DBSE / DBD)
- **Project**: The Society / Apartment Management Portal
- **Team**: Batch 7
