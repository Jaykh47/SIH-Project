# 🏛️ LANDSTACK — Unified Land Governance Platform

> **A Parcel-Centric Digital Infrastructure & Interoperability Engine for Connected Land Governance**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B%20%7C%20PostGIS-3.x-336791.svg)](https://postgis.net/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-199900.svg)](https://leafletjs.com/)

---

## 📌 Executive Summary

India's land administration is historically siloed across disconnected departments — Revenue (Bhu-Abhilekh/Dharani), Registration (IGRS deeds), Municipal Corporations (Property tax & building permits), Town Planning (Zoning/Masterplans), and Survey Directorates (Cadastral boundaries). 

**LANDSTACK** bridges these silos without requiring departments to abandon their existing legacy systems. By anchoring all records to the **ULPIN (Unique Land Parcel Identification Number)** — the digital Aadhaar for land — LandStack creates a unified, single source of truth with real-time cross-departmental sync, geospatial intelligence, automated conflict alerts, and citizen-first self-service.

```
                  ┌────────────────────────────────────────┐
                  │    ULPIN (14-character Geo-ID)         │
                  └───────────────────┬────────────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ↓                              ↓                              ↓
┌──────────────┐              ┌──────────────┐              ┌────────────────┐
│   Revenue    │              │ Registration │              │   Municipal    │
│ (RoR/Khasra) │              │ (Deeds/IGRS) │              │  (Tax/Permits) │
└──────┬───────┘              └──────┬───────┘              └────────┬───────┘
       │                             │                               │
       └──────────────────────┐      │      ┌────────────────────────┘
                              ↓      ↓      ↓
                       ┌─────────────────────────┐
                       │   LANDSTACK PLATFORM    │
                       │  (Spatial & Data Lake)  │
                       └─────────────┬───────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ↓                                                   ↓
┌───────────────────────┐                           ┌────────────────────┐
│   Unified GIS & RoR   │                           │ Automated Sentinel │
│  4-Tab Parcel Dossier │                           │  Anomaly & AI Risk │
└───────────────────────┘                           └────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 1. 🗺️ Pan-India Spatial Explorer & GIS Overlays
- **All 36 States & UTs Explorer**: Search and zoom to any state and district across India via integrated location lookups.
- **High-Precision PostGIS Boundary Rendering**: Dynamic GeoJSON boundary visualization with interactive styling, area measurements, and boundary coordinates.
- **Multilayer GIS Overlays**:
  - 🟡 **Zoning Layer (R2 - Medium Density Residential)**: Planning buffers and setback verification.
  - 🔵 **Underground Water Main Utility Polyline**: Infrastructure easement compliance.
  - 🔴 **Aviation / Coastal Height Restriction Polygon**: Strict safety zoning buffers.
- **Quick Demo Jump**: Instant camera navigation to seeded demonstration parcels in Howrah / Kolkata, West Bengal.

### 2. 📑 4-Tab Unified Parcel Dossier
Clicking any parcel opens an authoritative inter-departmental dossier:
- **Overview**: ULPIN, plot number, surveyed GIS area vs. recorded legal area, tenure status, dispute tags.
- **Rights & Ownership (RoR)**: Primary owner, Aadhaar linkage, mutation history, Khata/Khasra numbers.
- **Planning & Zoning**: Master plan designation, permissible FAR/FSI, setback requirements, utility clearances.
- **Fiscal & Tax**: Municipal assessment ID, annual demand, payment receipt history, and tax clearance status.

### 3. ⚡ 5-Stage Inter-Departmental Workflow Simulator
Simulates end-to-end institutional synchronization when a land event occurs (e.g. Sale Deed Execution):
1. **Deed Registration**: IGRS validates Stamp Duty, biometric identity, and encumbrance certificate.
2. **Title Verification**: Automated cross-check against Revenue Bhu-Abhilekh database.
3. **Revenue Mutation**: Field verification by Revenue Inspector, digital mutation order issued.
4. **Survey & Cadastral Update**: PostGIS boundary check, ULPIN verification, spatial split/merge.
5. **Municipal Tax Roll Sync**: Automated property tax ledger transfer to the new owner.
- *Includes live transaction SLA tracker, immutable audit trail, and real-time M2M API event streaming.*

### 4. 🏛️ Department Integration Status & Health Monitor
- Real-time sync heartbeat for 6 nodal departments:
  - **Revenue Department (Bhu-Abhilekh)**
  - **Inspector General of Registration (IGRS)**
  - **Municipal Corporation (Property Tax)**
  - **Town & Country Planning (Zoning)**
  - **Directorate of Land Records & Survey**
  - **ISRO / Sentinel Satellite Change Monitor**
- Displays protocol type (REST / GraphQL / OGC WFS / Kafka), sync frequency, and live latency (ms).

### 5. 🛡️ Citizen Self-Service & Action Desk
- **Express Ownership Verification**: Instant single-click ULPIN ownership report.
- **Live Deed Status Tracker**: Track pending mutations and deed registrations across government offices.
- **Unified Property Health Card**: One-page downloadable PDF-ready summary with QR code verification.
- **Grievance Redressal / Express Ticket**: Direct submission for boundary disputes or tax ledger corrections.

### 6. 🤖 AI Sentinel & Governance Alerts
- **Unauthorized Encroachment Detection**: Compares high-resolution historical satellite rasters against cadastral parcels.
- **Data Quality Alerts**: Automatically flags area discrepancies (e.g., recorded 0.35 acres vs. surveyed 0.38 acres).
- **Human-in-the-Loop Officer Verification**: Allows authorized officers to review machine alerts, attach ground inspection notes, and resolve cases.

---

## 👥 Demo Personas & Credentials

The platform includes a built-in **Role-Based Access Control (RBAC)** engine. All pre-seeded demo accounts share the password: `Password123!`

| Role | Name | Email | Aadhaar No. | Key Permissions |
|---|---|---|---|---|
| **Revenue Officer** | Priya Sharma | `revenue.officer@landstack.gov.in` | `4523-8912-3456` | Verify mutations, view RoR, manage AI alerts |
| **Citizen** | Rajesh Kumar | `rajesh.kumar@example.com` | `2345-6789-0123` | Search public parcels, track deeds, download reports |
| **Registration Officer** | Amit Patel | `registration.officer@landstack.gov.in` | `7890-1234-5678` | Deed execution, encumbrance certificates |
| **Municipality Officer** | Sunita Rao | `municipality.officer@landstack.gov.in` | `8901-2345-6789` | Tax assessment, building permits, utility links |
| **Survey Officer** | Vikram Singh | `survey.officer@landstack.gov.in` | `9012-3456-7890` | Boundary edits, cadastral sync, GIS accuracy |
| **Administrator** | Arjun Nair | `admin@landstack.gov.in` | `1234-5678-9012` | Full system governance, audit trails, user roles |

> 💡 **Pro-Tip**: Use the **Persona Switcher** in the top navigation bar to instantaneously switch roles during a live demonstration!

---

## 🛠️ Architecture & Tech Stack

```
LandStack/
├── backend/                  # Node.js 20+ & Express.js REST API
│   ├── src/
│   │   ├── controllers/      # Parcel, auth, alert, workflow controllers
│   │   ├── db/               # PostgreSQL + PostGIS connection pool
│   │   ├── middleware/       # JWT verification & RBAC authorization
│   │   ├── routes/           # REST endpoints (/api/v1/...)
│   │   └── server.js         # HTTP server & CORS configuration
│   └── tests/                # Automated API integration test suite
├── frontend/                 # React 19 + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI cards, tables, modals
│   │   ├── pages/            # MapPage, Dashboard, Workflows, Services, Login
│   │   ├── services/         # Axios API client, Location service (India Pincodes)
│   │   ├── hooks/            # Dynamic location and state management
│   │   └── layouts/          # Responsive navigation & role switcher
├── database/                 # Database migrations & seeds
│   └── migrations/           # PostGIS extensions, DDL schema, synthetic parcels
├── ai-service/               # Python FastAPI microservice (satellite analysis)
└── docs/                     # Architecture, GIS, API, and deployment documentation
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** 20+ & **npm**
- **PostgreSQL** 15+ with **PostGIS** extension (`CREATE EXTENSION postgis;`)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/LandStack.git
cd LandStack
```

### 2. Database Setup
Ensure PostgreSQL is running locally on port 5432, then execute the schema and seed scripts:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE landstack;"

# Run migrations in order:
cd database
psql -U postgres -d landstack -f migrations/001_create_extensions.sql
psql -U postgres -d landstack -f migrations/002_create_schema.sql
psql -U postgres -d landstack -f migrations/003_synthetic_seeds.sql
psql -U postgres -d landstack -f migrations/003b_seed_fixes.sql
cd ..
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your DB password if different from default
npm install
npm run dev
# Backend runs at http://localhost:3001
```

Run automated integration tests to confirm everything is working:
```bash
npm test
# 13/13 tests pass
```

### 4. Frontend Setup
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

Open `http://localhost:5173` in your browser and log in with any demo account!

---

## 🌐 Production Internet Deployment

You can deploy the entire LandStack stack for **free** on modern cloud platforms:

### Architecture
- **Database**: [Supabase](https://supabase.com/) (Managed PostgreSQL with PostGIS support)
- **Backend API**: [Render](https://render.com/) or [Railway](https://railway.app/) (Node.js Web Service)
- **Frontend App**: [Vercel](https://vercel.com/) (Vite React Client)

---

### Step 1: Deploy Database on Supabase
1. Create a free project on [Supabase](https://supabase.com/).
2. Go to **SQL Editor** and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Copy and paste the contents of:
   - `database/migrations/002_create_schema.sql`
   - `database/migrations/003_synthetic_seeds.sql`
   - `database/migrations/003b_seed_fixes.sql`
4. Go to **Project Settings > Database** and copy the **URI Connection String** (format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`).

---

### Step 2: Deploy Backend API on Render
1. Push this repository to your GitHub account.
2. Sign in to [Render](https://render.com/) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: *(Your Supabase connection string from Step 1)*
   - `DB_SSL`: `true`
   - `JWT_SECRET`: *(A secure 32+ character random string)*
   - `FRONTEND_URL`: `https://your-landstack.vercel.app` *(or `*` during initial setup)*
6. Click **Deploy Web Service**. Once deployed, copy your Render URL (e.g. `https://landstack-api.onrender.com`).

---

### Step 3: Deploy Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the **Environment Variable**:
   - `VITE_API_URL`: `https://landstack-api.onrender.com/api` *(replace with your Render backend URL)*
5. Click **Deploy**.
6. Update the `FRONTEND_URL` in your Render backend settings to match your new Vercel domain!

---

## 📡 Core API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate with email/Aadhaar & password |
| `GET` | `/api/parcels` | Public | Retrieve GeoJSON FeatureCollection of parcels |
| `GET` | `/api/parcels/search?q=:query` | Public | Search parcels by ULPIN, owner, or plot |
| `GET` | `/api/parcels/:ulpin/unified` | Authenticated | Aggregated cross-department dossier for parcel |
| `GET` | `/api/alerts/summary` | Officers | Pending AI & data discrepancy alert counts |
| `GET` | `/api/alerts/ai` | Officers | List satellite-flagged land-use anomalies |
| `POST` | `/api/alerts/:id/verify` | Officers | Submit human-in-the-loop verification |
| `GET` | `/mock/revenue/:ulpin` | Internal | Federated Revenue department adapter |
| `GET` | `/mock/registration/:ulpin`| Internal | Federated IGRS deed registration adapter |
| `GET` | `/mock/tax/:ulpin` | Internal | Federated Municipal property tax adapter |

---

## 🔒 Security & Data Privacy

- **RBAC & Zero Trust**: Strict Least-Privilege enforcement on all API endpoints.
- **Encrypted Credentials**: Passwords salted and hashed with `bcrypt` (12 rounds).
- **Stateless Authentication**: Signed JSON Web Tokens with strict expiration.
- **SQL Injection Prevention**: Parameterized PostGIS queries throughout all database calls.
- **CORS & Rate Limiting**: Controlled origins with sliding-window DDoS rate limiters.

---

## 📜 Disclaimer & Compliance

> ⚠️ **Academic / Hackathon Prototype**:
> All parcel numbers, spatial geometries, Aadhaar IDs, and ownership records in this platform are **100% synthetic** generated for demonstration purposes. They do not represent or expose real government records.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
