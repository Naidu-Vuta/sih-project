# CoopGig: Cooperative Gig Services Platform for Household & Community Services

> **Theme**: *"Empowering Workers. Serving Communities."*  
> Built for the **Smart India Hackathon (SIH)**.

---

## 🌟 Executive Summary

Traditional corporate gig platforms extract **25% to 30% commissions** from every transaction, penalize workers through opaque black-box algorithms, and treat local craftspeople as disposable contractors with zero safety net.

**CoopGig** reimagines the gig economy as a **Worker-Owned Platform Cooperative**:
- **95% Direct Wage**: Only a transparent 5% platform fee is retained (3% for emergency/healthcare fund and 2% for tech operations).
- **Democratic Governance**: Every verified artisan is a member-owner with **1 worker = 1 vote** on platform rules and pricing.
- **Patronage Dividends**: Operational surpluses are redistributed annually back to worker members proportional to jobs completed.
- **Verified Craftsmanship**: Background-verified local professionals in Electrical, Plumbing, Cleaning, Carpentry, Painting, and Elderly Care.

---

## 🚀 Live Demo Credentials (1-Click Evaluation)

On the `/login` page, you can click the **1-Click Demo Pills** or enter:

| Role | Email | Password | Access & Features |
|---|---|---|---|
| **Platform Admin** | `admin@coop.local` | `Admin@123` | Platform KPIs, Worker KYC verification approval queue, Cooperative reserve fund audit, booking oversight |
| **Worker (Verified)** | `rajesh.electric@coop.local` | `Worker@123` | Live availability toggle, job requests acceptance, job status lifecycle (`IN_PROGRESS` ➔ `COMPLETED`), cooperative earnings & patronage dividend tracker |
| **Worker (Pending KYC)** | `deepak.paint@coop.local` | `Worker@123` | Demonstrates the worker onboarding and admin KYC approval workflow |
| **Customer** | `priya.sharma@example.com` | `Customer@123` | Browse catalog, instant transparent booking, live booking tracker, review submission |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS
- **Navigation**: React Router v6
- **HTTP Client**: Axios with automatic Bearer JWT interceptors
- **Icons & UI**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js & Express.js with TypeScript
- **Database & ORM**: Prisma ORM
  - **Local Development**: SQLite (`file:./dev.db`) for immediate zero-config execution
  - **Production / Deployment**: PostgreSQL (`prisma/schema.postgresql.prisma` + `docker-compose.yml`)
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiry
- **Security**: bcrypt password hashing (10 salt rounds)
- **Validation**: Zod schema validation middleware
- **Architecture**: REST API with modular controllers, routes, and error handling

---

## 📂 Project Architecture

```
sih project/
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   └── common/           # Navbar, Footer, BookingModal, ReviewModal, ProtectedRoute
│   │   ├── context/              # AuthContext (JWT, session persistence, user state)
│   │   ├── layouts/              # Responsive navbar & footer wrappers
│   │   ├── pages/
│   │   │   ├── public/           # HomePage, ServicesPage, AboutPage, ContactPage, LoginPage, RegisterPage
│   │   │   └── dashboard/        # CustomerDashboard, WorkerDashboard, AdminDashboard
│   │   ├── services/             # Axios API client & endpoint modules (auth, service, booking, worker, admin)
│   │   ├── types/                # Strict TypeScript interfaces
│   │   └── index.css             # Tailwind base & custom utility styles
│   └── package.json
│
├── backend/                      # Node.js + Express.js + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma         # Active Prisma schema (User, Profiles, Service, Booking, Review, Metrics)
│   │   ├── schema.postgresql.prisma # PostgreSQL production schema
│   │   └── seed.ts               # Realistic demo seed script for SIH demonstration
│   ├── src/
│   │   ├── config/               # Prisma client, JWT secrets, platform financial rates
│   │   ├── controllers/          # auth, service, booking, worker, admin, review
│   │   ├── middleware/           # authMiddleware, requireRole (RBAC), validate, errorHandler
│   │   ├── routes/               # Modular Express API routers
│   │   ├── utils/                # Password hashing, JWT token generator, Zod schemas, API responses
│   │   └── server.ts             # Express server entrypoint
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml            # Docker setup for PostgreSQL & pgAdmin
├── package.json                  # Root runner scripts
└── README.md
```

---

## 🏃 Running the Application

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### 1. Quick Start (Both Servers)

From the project root:
```bash
# Install dependencies for both frontend and backend
npm run install:all

# Seed the database with realistic demo data
npm run seed

# Run both servers concurrently:
# Backend on http://localhost:5000
# Frontend on http://localhost:5173
npm run dev:backend
# In another terminal:
npm run dev:frontend
```

### 2. Using PostgreSQL (Optional Production Mode)

If you prefer running a dedicated PostgreSQL server:
```bash
# Start PostgreSQL & pgAdmin in Docker
docker compose up -d

# Update backend/.env:
# DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/coop_gig_db?schema=public"

# Copy PostgreSQL schema:
cp backend/prisma/schema.postgresql.prisma backend/prisma/schema.prisma

# Push schema and seed
cd backend
npx prisma db push
npm run seed
```

---

## 📋 Key Pages & User Journeys

### 1. Public Experience
- **Landing Page (`/`)**: Highlighting "Empowering Workers. Serving Communities.", the cooperative manifesto, live metrics ledger (Fair wages paid, worker co-owners, dividends distributed), trade categories, and corporate comparison.
- **Services Catalog (`/services`)**: Category filtering (Electrical, Plumbing, Cleaning, Carpentry, Painting, Care), live search, duration estimates, transparent 95% wage breakdown pill, and instant booking modal.
- **About the Cooperative (`/about`)**: Detailed walkthrough of the 7 International Cooperative Principles, democratic governance (1 Worker = 1 Vote), and the 95/3/2 revenue split.
- **Contact & Grievance Cell (`/contact`)**: Helpdesk and member grievance submission.
- **Onboarding (`/register` & `/login`)**: Multi-role registration (Customer vs Worker Co-owner) and 1-click evaluation demo buttons.

### 2. Customer Dashboard (`/customer/dashboard`)
- Real-time status badges: `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- Assigned worker details with direct phone contact and verified badge.
- Instant booking cancellation for pending requests.
- Verified 5-star rating & review submission for completed services.

### 3. Worker Dashboard (`/worker/dashboard`)
- **Live Duty Switch**: Toggle between `Available` and `Off Duty`.
- **Cooperative Financials**: Direct fair earnings (95%), patronage dividends earned, member equity shares.
- **Job Requests Inbox**: Neighborhood requests with 1-click `Accept Job`.
- **Active Job Progress**: Start work (`IN_PROGRESS`) and mark `COMPLETED` (which automatically updates the worker's earnings, adds patronage dividends, and records platform metrics).

### 4. Admin Dashboard (`/admin/dashboard`)
- **Platform Telemetry**: Gross Transaction Value (GTV), total bookings, active workers, fair wages distributed.
- **Worker KYC Verification Queue**: Inspect applicant trade skills, experience, and bio. 1-click **Verify & Grant Co-op Equity** or revoke verification.
- **Cooperative Reserve Ledger**: Real-time auditing of community welfare and emergency pools.
- **Live Dispatch Audit Log**: Searchable table of all customer bookings across trades.

---

## 🛡️ Security & Quality Best Practices
- **Password Security**: Salted bcrypt hashing.
- **Token Security**: Strict Bearer token authentication verified on every protected route.
- **Role-Based Access Control (RBAC)**: Enforced both on server endpoints via `requireRole(...)` and on the client via `<ProtectedRoute allowedRoles={[...]} />`.
- **Data Validation**: Strict Zod validation on all API requests.
- **Graceful Error Handling**: Unified error response formats and user-friendly toast feedback.
