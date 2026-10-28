# QueueLess REST API Documentation

This document provides a comprehensive reference for all RESTful API endpoints in **QueueLess**.

## Base URL
- Development: `http://localhost:5000/api`
- Vite Proxy: `/api`
- SSR Receipts: `http://localhost:5000/receipt`

---

## 1. Authentication & Profile Endpoints

All session authentication relies on encrypted HTTP-only cookies (`queueless.sid`).

### 1.1 Register New Account
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Deekshitha NVSS",
  "email": "student@queueless.edu",
  "password": "StudentPassword123!",
  "studentId": "22CSE1042",
  "department": "Computer Science & Engineering",
  "phone": "+91 91234 56789"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "662bb38198f2445e999c1001",
      "name": "Deekshitha NVSS",
      "email": "student@queueless.edu",
      "role": "student",
      "studentId": "22CSE1042",
      "department": "Computer Science & Engineering"
    }
  }
}
```

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public (Rate-limited to 50 attempts / 15 minutes)
- **Request Body:**
```json
{
  "email": "student@queueless.edu",
  "password": "StudentPassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "662bb38198f2445e999c1001",
      "name": "Deekshitha NVSS",
      "email": "student@queueless.edu",
      "role": "student"
    }
  }
}
```

### 1.3 User Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated
- **Response (200 OK):** Destroys session in MongoDB and clears cookie.

### 1.4 Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated (Any role)

### 1.5 Update User Profile
- **Endpoint:** `PATCH /api/auth/profile`
- **Access:** Authenticated

---

## 2. Services Management Endpoints

### 2.1 List All Services
- **Endpoint:** `GET /api/services`
- **Access:** Public
- **Query Parameters:**
  - `category` (optional, e.g. `Academic`, `Financial`)
  - `search` (optional, searches service name and code)
  - `includeInactive` (boolean, admin only)

### 2.2 Get Service Details & Live Slot Capacities
- **Endpoint:** `GET /api/services/:id?date=YYYY-MM-DD`
- **Access:** Public
- **Description:** Returns service information and dynamically computes remaining capacity for each 30-minute time slot.

### 2.3 Create New Service
- **Endpoint:** `POST /api/services`
- **Access:** Admin only (`role: 'admin'`)
- **Request Body:**
```json
{
  "name": "Certificates & Student Records",
  "code": "REC",
  "description": "Official transcripts and student bonafide records.",
  "category": "Academic",
  "counterName": "Counter 1",
  "estimatedDurationMin": 10,
  "slotCapacity": 5,
  "operatingHours": {
    "start": "09:00",
    "end": "16:30"
  }
}
```

### 2.4 Update Service
- **Endpoint:** `PATCH /api/services/:id`
- **Access:** Admin only

### 2.5 Deactivate Service
- **Endpoint:** `DELETE /api/services/:id`
- **Access:** Admin only (Soft-deactivates if active appointments exist)

---

## 3. Appointment Booking Endpoints

### 3.1 List Appointments
- **Endpoint:** `GET /api/appointments`
- **Access:** Authenticated (Students see only their own appointments; Staff/Admin see all)
- **Query Parameters:** `date`, `status`, `serviceId`, `search`, `page`, `limit`

### 3.2 Book Appointment & Issue Token
- **Endpoint:** `POST /api/appointments`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "serviceId": "662bb38198f2445e999c2001",
  "appointmentDate": "2026-10-29",
  "timeSlot": "10:00 - 10:30",
  "notes": "Transcript verification"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Appointment booked successfully! Your token has been issued.",
  "data": {
    "bookingReference": "QL-20261028-7A4B",
    "tokenNumber": "REC-005",
    "tokenSequence": 5,
    "status": "booked",
    "timeSlot": "10:00 - 10:30",
    "appointmentDate": "2026-10-29"
  }
}
```

### 3.3 Cancel Appointment
- **Endpoint:** `PATCH /api/appointments/:id/cancel`
- **Access:** Authenticated (Owner student, staff, or admin)

---

## 4. Live Queue Endpoints

### 4.1 Get Service Live Queue
- **Endpoint:** `GET /api/queue/:serviceId?date=YYYY-MM-DD`
- **Access:** Public / Authenticated
- **Returns:** Currently serving token, waiting list in order, people ahead, and calculated estimated waiting time.

### 4.2 Track Individual Token Status
- **Endpoint:** `GET /api/queue/token/:tokenIdOrBookingRef`
- **Access:** Public / Authenticated

### 4.3 Staff: Call Next Token
- **Endpoint:** `POST /api/queue/:serviceId/next`
- **Access:** Staff or Admin (`role: ['staff', 'admin']`)
- **Description:** Summons the next sequential token in line.

### 4.4 Staff: Update Token Status
- **Endpoint:** `PATCH /api/queue/token/:tokenId/status`
- **Access:** Staff or Admin
- **Request Body:**
```json
{
  "status": "serving",
  "reason": "Student arrived at counter"
}
```
Allowed status transitions:
- `booked` -> `waiting` (called), `cancelled`
- `waiting` -> `serving`, `skipped`, `cancelled`
- `serving` -> `completed`, `skipped`, `cancelled`
- `skipped` -> `waiting` (recalled), `cancelled`

---

## 5. Administration & Analytics Endpoints

### 5.1 Dashboard Summary Metrics
- **Endpoint:** `GET /api/admin/dashboard`
- **Access:** Admin only

### 5.2 Registered Users List & Search
- **Endpoint:** `GET /api/admin/users?role=student&search=...&page=1&limit=15`
- **Access:** Admin only

### 5.3 Toggle User Active Status
- **Endpoint:** `PATCH /api/admin/users/:id/status`
- **Access:** Admin only

### 5.4 Manage Staff Accounts
- **Endpoint:** `GET /api/admin/staff` and `POST /api/admin/staff`
- **Access:** Admin only

### 5.5 Aggregation Analytics
- **Endpoint:** `GET /api/admin/analytics`
- **Access:** Admin only
- **Aggregation Pipelines:**
  - Daily bookings and completion trend
  - Status breakdown (completed, cancelled, skipped, waiting)
  - Peak hours analysis
  - Service volume demand

---

## 6. Server-Side Rendered (SSR) EJS Receipt

### 6.1 View & Print Official Token Receipt
- **Endpoint:** `GET /receipt/:bookingReference`
- **Access:** Public / Direct URL (e.g. `http://localhost:5000/receipt/QL-20261028-A01`)
- **Render Engine:** EJS (Embedded JavaScript)
- **Features:** Clean printable view with print trigger button (`window.print()`).
