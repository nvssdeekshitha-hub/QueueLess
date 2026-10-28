# QueueLess — Smart Appointment & Digital Queue Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.2-blue.svg)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Local-emerald.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **QueueLess** is a full-stack smart appointment booking and digital queue management platform that eliminates physical waiting lines in college administration offices, clinics, salons, and service centers.

---

## 1. Problem Statement & Proposed Solution

### The Problem
Physical waiting queues in university administrative centers (such as academic records, fee counters, and library desks) cause:
- **Wasted Student Hours:** Hours spent standing in physical lines instead of attending lectures or studying.
- **Counter Congestion:** Administrative offices face overcrowded hallways, noise, and friction.
- **Unpredictable Wait Times:** Students have no visibility into how many people are ahead or when their turn will arrive.
- **Overburdened Staff:** Officers lack automated workflow tools to summon, serve, or reschedule students efficiently.

### The QueueLess Solution
QueueLess transforms physical lines into a structured, transparent, digital queue:
1. **Capacity-Managed Booking:** Students select specific dates and 30-minute time slots with real-time capacity checks to prevent overbooking.
2. **Digital Queue Tokens:** Instant sequential tokens (e.g. `REC-001`, `FEE-012`) with unique booking references and printable server-rendered receipts.
3. **Live Queue Tracking:** Real-time visibility displaying the current token being served, number of people ahead, and calculated estimated wait times.
4. **Staff Command Console:** Administrative staff can call next tokens, track service durations, and mark appointments as serving, completed, skipped, or cancelled.
5. **Administrative Governance:** Institution-wide analytics, service capacity tuning, staff assignments, and audit trails.

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js (v18.2) with Vite
- **Routing:** React Router v6
- **State & Context:** React Hooks (`useState`, `useEffect`, `useContext`, `useRef`, `useCallback`)
- **Icons:** Lucide React
- **Visual Analytics:** Recharts
- **Styling:** Custom design system with CSS tokens and responsive grids
- **HTTP Client:** Axios with credentialed session interceptors

### Backend
- **Runtime:** Node.js (v18+) with native ES Modules
- **Framework:** Express.js (v4.19)
- **Session Security:** `express-session` with MongoDB-backed session persistence via `connect-mongo`
- **Password Hashing:** `bcryptjs`
- **Security & Headers:** `helmet`, `cors` with credentials, and `express-rate-limit`
- **Template Engine:** EJS (server-rendered appointment receipts)
- **Logging:** `morgan` and custom request duration logger

### Database
- **Database Engine:** MongoDB (MongoDB Atlas or Local MongoDB)
- **ODM:** Mongoose (v8.3) with schemas, compound indexes, references, and aggregation pipelines

---

## 3. User Roles & Permissions (RBAC)

| Role | Accessible Pages & Actions | Backend Authorization |
|---|---|---|
| **Student / User** | • Browse administrative services<br>• View live slot capacities<br>• Book appointments & receive tokens<br>• Track live queue position & wait time<br>• Cancel upcoming bookings<br>• View appointment history & print SSR receipts<br>• Manage personal profile | Authenticated session (`role: 'student'`) |
| **Staff Officer** | • Access staff command console<br>• Call next token in queue<br>• Update status: Serving, Completed, Skipped, Cancelled<br>• View counter statistics<br>• Search queue records by token/name | Authenticated session (`role: ['staff', 'admin']`) |
| **Administrator** | • High-level dashboard counters<br>• Create, edit, and deactivate services<br>• Configure operating hours and slot capacities<br>• Manage staff credentials & assignments<br>• Master appointment audit & deletion<br>• Advanced analytics (trends, peak hours, distributions) | Authenticated session (`role: 'admin'`) |

---

## 4. Project Directory Structure

```text
QueueLess/
├── client/                     # React + Vite Single Page Application
│   ├── public/                 # Static assets (favicon.svg)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── common/         # Navbar, Sidebar, Footer, StatusBadge, ErrorBoundary, LoadingSpinner
│   │   ├── context/            # AuthContext (session state provider)
│   │   ├── hooks/              # useAuth, useQueue custom polling hooks
│   │   ├── layouts/            # MainLayout (public) & DashboardLayout (authenticated)
│   │   ├── pages/              # 20 complete application pages
│   │   ├── routes/             # AppRoutes and ProtectedRoute RBAC guards
│   │   ├── services/           # Axios API modules (auth, service, appointment, queue, admin)
│   │   └── styles/             # Global CSS design tokens & utilities
│   ├── package.json
│   └── vite.config.js          # API proxy configuration
├── server/                     # Express.js REST API & EJS SSR Engine
│   ├── scripts/                # Database seed, admin initialization, lab drop scripts
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js) & session config (session.js)
│   │   ├── controllers/        # Auth, Service, Appointment, Queue, Admin, Receipt controllers
│   │   ├── middleware/         # Auth verification, RBAC, error handling, request logging
│   │   ├── models/             # Mongoose schemas (User, Service, Appointment, QueueAudit)
│   │   ├── routes/             # REST route definitions
│   │   ├── services/           # Queue business logic & concurrency checks
│   │   ├── utils/              # Response helpers & token generators
│   │   ├── validators/         # Input validation middleware
│   │   ├── app.js              # Express app setup & middleware stack
│   │   └── server.js           # Server entry point with graceful shutdown
│   ├── tests/                  # Automated integration tests (Vitest + Supertest)
│   ├── views/                  # EJS server-rendered templates (receipt.ejs)
│   ├── package.json
│   └── vitest.config.js
├── docs/                       # Comprehensive documentation
│   ├── api-documentation.md    # Complete REST API reference
│   ├── architecture.md         # System design, diagrams & state machine
│   ├── mongodb-practicals.md   # Syllabus mapping to MongoDB CRUD & aggregations
│   └── testing.md              # Automated testing guide
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules for node_modules, .env, build output
├── package.json                # Root monorepo scripts (concurrent dev)
└── README.md
```

---

## 5. Prerequisites

Before running the application, ensure you have:
- **Node.js:** v18.0.0 or higher (`node -v`)
- **npm:** v9.0.0 or higher (`npm -v`)
- **MongoDB:** An active MongoDB Atlas connection URI or local MongoDB instance running on port 27017.

---

## 6. Windows PowerShell Setup Instructions

Follow these exact steps in Windows PowerShell to set up and start the application:

### Step 1: Clone the Repository
```powershell
git clone https://github.com/nvssdeekshitha-hub/QueueLess.git
cd QueueLess
```

### Step 2: Install Monorepo Dependencies
Run the unified installation script from the root directory:
```powershell
npm run install:all
```
*(This automatically runs `npm install` at the root, within `/server`, and within `/client`.)*

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` in the root (and `/server` if running independently):
```powershell
Copy-Item .env.example server\.env
```
Open `server\.env` and configure your MongoDB URI:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/queueless?retryWrites=true&w=majority
SESSION_SECRET=queueless_super_secret_session_key_2026_dev
SESSION_MAX_AGE_MS=86400000
CLIENT_URL=http://localhost:5173
```
> **Note:** If you have a local MongoDB daemon installed and running, you can use `mongodb://localhost:27017/queueless`.

### Step 4: Seed the Database
Populate the database with realistic administrative services, counters, staff, students, and sample appointments:
```powershell
npm run seed
```

### Step 5: Start Frontend and Backend Concurrently
Run both the Express backend (:5000) and React Vite frontend (:5173) with a single command:
```powershell
npm run dev
```

---

## 7. Application Access URLs & Demo Accounts

Once started, access the application in your browser:
- **Frontend SPA:** [http://localhost:5173](http://localhost:5173)
- **Backend API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Server-Side Rendered Receipt Demo:** [http://localhost:5000/receipt/QL-20261028-A01](http://localhost:5000/receipt/QL-20261028-A01)

### Pre-Configured Test Accounts (Quick Demo Login)
The login screen features one-click buttons to instantly sign in as any of these roles:

| Role | Email | Password | Intended Portal |
|---|---|---|---|
| **Student** | `student@queueless.edu` | `StudentPassword123!` | `/dashboard` (Student Portal) |
| **Staff** | `staff.records@queueless.edu` | `StaffPassword123!` | `/staff` (Queue Console) |
| **Administrator** | `admin@queueless.edu` | `AdminPassword123!` | `/admin` (System Administration) |

---

## 8. Academic Syllabus Concepts Demonstrated

This project is architected specifically to demonstrate core full-stack software engineering concepts:

### Express.js Topics Demonstrated
1. **Routing & HTTP Methods:** Clean REST endpoints using `GET`, `POST`, `PATCH`, `DELETE` with route parameters (`:serviceId`, `:tokenId`) and query parameters (`?status=waiting&date=...`).
2. **Middleware Pipeline:** Reusable middleware for authentication, RBAC authorization, JSON payload parsing, request logging, and rate limiting.
3. **Session Management & Cookies:** Secure session persistence in MongoDB using `express-session` and `connect-mongo`. Configures HTTP-only cookies and prevents session fixation via `req.session.regenerate()`.
4. **Hybrid Server-Side Rendering (SSR):** Coexistence of an EJS server-rendered receipt route (`/receipt/:bookingReference`) alongside the React single-page application.
5. **Centralized Error Handling:** Custom 404 handler and global error middleware catching Mongoose CastErrors, duplicate key codes (E11000), and validation errors.

### React.js Topics Demonstrated
1. **Components:** Modular structure with common reusable components (`Navbar`, `Sidebar`, `StatusBadge`, `ConfirmationModal`, `LoadingSpinner`, `EmptyState`).
2. **Class Component & Lifecycle:** Features an educational class component `ErrorBoundary.jsx` implementing `getDerivedStateFromError` and `componentDidCatch`.
3. **Hooks:** Practical usage of `useState`, `useEffect`, `useContext`, `useRef`, and `useCallback`.
4. **Custom Hooks:** Custom polling hook `useQueue.js` for automatic 5-second queue status refreshes with pause/resume functionality.
5. **Context API:** Global session management in `AuthContext.jsx` with persistent cookie revalidation on refresh.
6. **React Router v6:** Declarative routing with `ProtectedRoute` guards verifying both authentication and role authorization.
7. **Controlled Forms:** Full client-side validation, password matching, capacity feedback, and server error presentation.
8. **Responsive UI:** CSS design tokens, flexible grid layouts, and status color coding.

### MongoDB & Mongoose Topics Demonstrated
1. **Schema Validation & Types:** Mongoose models with `enum` constraints, string match regexes, min/max lengths, and references.
2. **CRUD Operations:** Real-world usage of `create()`, `find()`, `findOne()`, `findById()`, `findByIdAndUpdate()`, and `findByIdAndDelete()`.
3. **Indexing:** Single-field indexes and compound unique indexes (`{ service: 1, appointmentDate: 1, tokenSequence: 1 }`) for concurrency safety.
4. **Aggregation Framework:** Complex aggregation pipelines in `adminController.js` utilizing `$match`, `$group`, `$sort`, `$project`, `$lookup`, and `$unwind` for operational analytics.
5. **Development Database Script:** Safe database dropping demonstration in [dropDevDb.js](file:///c:/Users/abhin/Desktop/queueless/server/scripts/dropDevDb.js).

---

## 9. Automated Testing

QueueLess includes a suite of automated integration tests verifying authentication, authorization, slot capacity, token assignment, and queue workflows.

To run tests:
```powershell
npm test
```

For detailed test coverage documentation, see [docs/testing.md](file:///c:/Users/abhin/Desktop/queueless/docs/testing.md).

---

## 10. Troubleshooting Common Issues

- **MongoDB Connection Error:**
  - Verify that `MONGODB_URI` in `.env` has valid credentials and that your IP address is whitelisted in MongoDB Atlas Network Access (use `0.0.0.0/0` for development).
- **Port 5000 or 5173 in use:**
  - Change the `PORT` variable in `.env` (e.g. `PORT=5001`) and adjust the proxy in `client/vite.config.js`.
- **Session Cookie Not Storing:**
  - In local development across `localhost:5173` and `localhost:5000`, ensure `withCredentials: true` is enabled in Axios (already configured in `client/src/services/api.js`).

---

## 11. Production & Security Considerations

When deploying to a production cloud environment:
- Set `NODE_ENV=production`.
- Enable HTTPS so that session cookies are transmitted with `secure: true` and `sameSite: 'none'`.
- Generate a cryptographically strong `SESSION_SECRET` (at least 32 random characters).
- Never commit `.env` or database credentials to version control.

---

## 12. Author & License

- **Developer:** Deekshitha NVSS (B.Tech CSE)
- **Repository:** [https://github.com/nvssdeekshitha-hub/QueueLess](https://github.com/nvssdeekshitha-hub/QueueLess)
- **License:** MIT License
