# LANDSTACK — Architecture Documentation

## Overview

LANDSTACK is a **parcel-centric interoperability platform** built on the PERN + GIS + AI stack. Its core purpose is to create a unified, GIS-backed view of any land parcel by aggregating information from fragmented departmental systems.

---

## Architectural Philosophy

### Why "Parcel-Centric"?

Traditional approaches try to digitize one department's system. LANDSTACK starts from the *parcel* — a physical piece of land — and connects all relevant information to it using a common identifier: **ULPIN**.

```
ULPIN = Unique Land Parcel Identification Number
      = The common key that connects all departmental records
```

### Why NOT a MERN Stack?

| Stack | Problem |
|---|---|
| MongoDB | No native spatial indexing; poor for relational land records |
| Node only | Python's GIS ecosystem (GeoPandas, Rasterio, GDAL) is unmatched |
| Next.js | Unnecessary for this use case; adds complexity |

**LANDSTACK uses PERN + GIS + AI** because:
- PostgreSQL + PostGIS is the industry standard for spatial data management
- Python's scientific/GIS ecosystem handles satellite imagery and AI
- React + Leaflet gives a capable, lightweight GIS frontend

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                  │
│              (Citizens / Officers / Administrators)             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                     FRONTEND LAYER                              │
│              React + Vite + Tailwind CSS                        │
│              React Router (SPA navigation)                      │
│              Leaflet + GeoJSON (GIS map)                        │
│              JWT token storage (memory / sessionStorage)        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST / GeoJSON
┌───────────────────────────▼─────────────────────────────────────┐
│                     BACKEND LAYER                               │
│              Node.js + Express.js                               │
│              REST API (JSON + GeoJSON responses)                │
│              JWT verification middleware                         │
│              RBAC authorization middleware                       │
│              Rate limiting + CORS + Helmet                      │
│              Input validation (Zod)                             │
│              Audit logging                                      │
└────────┬──────────────────┬──────────────────┬──────────────────┘
         │                  │                  │
         │ SQL/PostGIS       │ HTTP             │ Mock Data
┌────────▼──────┐  ┌────────▼──────┐  ┌───────▼────────────────┐
│   DATABASE    │  │  AI SERVICE   │  │  MOCK DEPARTMENT APIs  │
│               │  │               │  │                        │
│  PostgreSQL   │  │  FastAPI      │  │  Revenue Mock          │
│  PostGIS      │  │  GeoPandas    │  │  Registration Mock     │
│  Spatial SQL  │  │  OpenCV       │  │  Tax Mock              │
│  Migrations   │  │  scikit-learn │  │  Municipality Mock     │
│  JSONB cols   │  │  Shapely      │  │  Planning Mock         │
└───────────────┘  └───────────────┘  └────────────────────────┘
```

---

## Component Details

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── layouts/          # Layout wrappers (nav, sidebar)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API call functions
│   ├── utils/            # Helper utilities
│   ├── map/              # Leaflet/GIS components
│   ├── App.jsx           # Router setup
│   └── main.jsx          # Entry point
```

**Key design decisions:**
- Vite for fast development and optimized builds
- Tailwind CSS for rapid, consistent styling
- Leaflet (not Mapbox) — open source, no API key required for prototype
- GeoJSON as the interchange format for all spatial data

### Backend (`/backend`)

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # Express route definitions
│   ├── services/         # Business logic
│   ├── middleware/        # Auth, RBAC, validation, logging
│   ├── models/           # Database query functions
│   ├── db/               # PostgreSQL connection pool
│   ├── utils/            # Shared utilities
│   └── config/           # Configuration loading
```

**Key design decisions:**
- Express.js — mature, well-understood, no unnecessary abstraction
- `pg` (node-postgres) — direct SQL, no ORM overhead; full PostGIS control
- Zod for input validation — type-safe schema validation
- Winston for structured logging

### AI Service (`/ai-service`)

```
ai-service/
├── app/
│   ├── api/              # FastAPI route handlers
│   ├── services/         # Change detection, anomaly detection
│   ├── gis/              # GeoPandas, Shapely utilities
│   ├── detection/        # Image processing, OpenCV
│   └── main.py           # FastAPI app entry point
```

**Key design decisions:**
- FastAPI — async Python framework, automatic OpenAPI docs
- Separate service — AI/Python ecosystem isolated from Node.js backend
- Start with image differencing (simple, explainable) before deep learning
- AI never modifies records — only generates alerts for human verification

### Database (`/database`)

```
database/
├── migrations/           # Sequential SQL migration files
├── seeds/                # Synthetic data population scripts
├── schemas/              # Schema diagrams / documentation
└── README.md             # Database-specific documentation
```

**Key design decisions:**
- PostgreSQL 18 — ACID compliance, strong relational model
- PostGIS 3.x — industry-standard spatial extension
- Migration-based schema management — reproducible, auditable
- SRID 4326 (WGS84) for storage; 32644 (UTM Zone 44N) for area calculations

---

## Data Flow

### Search Flow (ULPIN → Unified View)

```
1. User enters ULPIN in search bar
2. Frontend calls GET /api/parcels/search?q=WB-DGP-00012345
3. Backend queries PostGIS: SELECT * FROM parcels WHERE ulpin = $1
4. Backend calls mock department APIs (parallel):
   - GET /mock/revenue/:ulpin
   - GET /mock/registration/:ulpin
   - GET /mock/tax/:ulpin
   - GET /mock/municipality/:ulpin
   - GET /mock/planning/:ulpin
5. Backend runs data-quality checks:
   - Area mismatch check
   - Missing record check
   - Overlap detection
6. Backend fetches AI alerts from database
7. Response assembled as unified JSON
8. Frontend renders unified parcel view
9. Leaflet map centers on parcel GeoJSON geometry
```

### AI Change Detection Flow

```
1. Two satellite images provided (or synthetic images for prototype)
2. Python service preprocesses images (align, normalize)
3. Image differencing / change detection algorithm runs
4. Changed regions identified as polygons
5. PostGIS intersection: changed region ∩ parcel boundaries
6. Affected ULPINs identified
7. AI alert written to database:
   { ulpin, type, confidence, geometry, status: "pending" }
8. Officer receives alert in dashboard
9. Officer reviews image evidence + parcel data
10. Officer marks alert: "verified" | "dismissed" | "escalated"
11. Audit log records officer decision
```

---

## Security Architecture

```
Request
   │
   ▼
Rate Limiter (express-rate-limit)
   │
   ▼
CORS check (only allowed origins)
   │
   ▼
Helmet (security headers)
   │
   ▼
Input Validation (Zod schema)
   │
   ▼
JWT Verification (auth middleware)
   │
   ▼
RBAC Check (role-permission matrix)
   │
   ▼
Controller → Service → Database
   │
   ▼
Audit Log written
   │
   ▼
Response
```

### Role-Permission Matrix

| Resource | Citizen | Revenue | Registration | Municipality | Survey | Admin |
|---|---|---|---|---|---|---|
| View parcel (public fields) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View sensitive ownership | — | ✓ | ✓ | — | — | ✓ |
| Verify AI alerts | — | ✓ | — | ✓ | ✓ | ✓ |
| Process applications | — | ✓ | ✓ | ✓ | — | ✓ |
| Modify records | — | ✓ | — | — | ✓ | ✓ |
| Admin dashboard | — | — | — | — | — | ✓ |
| Manage users | — | — | — | — | — | ✓ |

---

## ULPIN Structure

```
WB  -  DGP  -  00012345
│       │          │
│       │          └── 8-digit parcel sequence number (village-level)
│       └────────────── District code (3 chars)
└────────────────────── State code (2 chars)

Examples:
WB-DGP-00000001   → West Bengal, Durgapur district, parcel 1
MH-PNE-00000042   → Maharashtra, Pune district, parcel 42
KA-BLR-00000007   → Karnataka, Bengaluru district, parcel 7
```

---

## Coordinate Reference Systems

| SRID | Name | Usage in LANDSTACK |
|---|---|---|
| 4326 | WGS84 (Lat/Lon) | Storage in PostGIS, GeoJSON output, Leaflet display |
| 32643 | UTM Zone 43N | Area calculation for central India parcels |
| 32644 | UTM Zone 44N | Area calculation for eastern India (West Bengal) |
| 32644 | UTM Zone 44N | Default for prototype synthetic data |

**Why store as WGS84?** Web mapping libraries (Leaflet, Google Maps) expect WGS84. We store in 4326 and transform to local UTM only for accurate area calculations using `ST_Area(ST_Transform(geometry, 32644))`.

---

## Interoperability Approach

LANDSTACK does NOT attempt to replace departmental systems.

It implements a **federated aggregation pattern**:

```
Department Database       LANDSTACK
      │                       │
      │   API / File export   │
      └───────────────────────►
                              │
                    Common Data Model
                              │
                    Source attribution
                    preserved always:
                    {
                      source_system: "revenue_wb",
                      source_field: "khasra_no",
                      source_value: "234/2",
                      common_concept: "parcel_number",
                      synced_at: "2026-09-14"
                    }
```

For the prototype, this is implemented as **mock department APIs** that return realistic synthetic data. In production, these would connect to actual departmental APIs or data exports.

---

## Limitations (Prototype)

1. **Synthetic Data Only** — No real government data
2. **No Real Satellite Integration** — AI uses synthetic/sample imagery
3. **Mock Department APIs** — Not connected to real departmental systems
4. **Single-Region Prototype** — Designed around West Bengal for the demo
5. **No SMS/Email Notifications** — Simulated only
6. **No Production Hardening** — Not ready for internet-facing deployment without additional security review
