# LANDSTACK — API Reference Documentation

The LANDSTACK backend exposes standard RESTful endpoints delivering JSON and GeoJSON payloads. All endpoints use standard HTTP response codes and bearer JWT token authorization.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
Authenticates an officer or citizen.
- **Request:**
  ```json
  { "email": "revenue@wb.gov", "password": "Officer@123" }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "userId": "1a4e2a7e-...",
        "email": "revenue@wb.gov",
        "fullName": "Rajesh Patel",
        "roleName": "revenue_officer",
        "department": "Revenue Dept WB"
      }
    }
  }
  ```

---

## 2. Parcels & Spatial GIS (`/api/parcels` & `/api/map`)

### `GET /api/parcels` or `GET /api/map`
Returns all active cadastral parcel boundaries as a GeoJSON `FeatureCollection` for Leaflet/GIS rendering.

### `GET /api/parcels/search?q={query}`
Searches parcels by ULPIN, Khasra/Plot number, or owner name.

### `GET /api/parcels/:ulpin/unified`
Aggregates full cross-department records for the parcel:
- Core cadastral properties & GeoJSON geometry
- Revenue Dept ownership (RoR / Khatian)
- Registration Dept deeds (IGRS)
- Property tax & municipal arrears
- Building permissions & master plan zoning
- Active civil disputes & court cases
- Data quality discrepancies & AI satellite alerts

---

## 3. Alerts & Anomaly Intelligence (`/api/alerts`)

### `GET /api/alerts/summary`
Returns counts of pending and resolved AI and quality alerts. (Requires `view:dashboard` permission).

### `GET /api/alerts/ai?status={pending|verified|dismissed|all}`
Lists satellite change candidates flagged by computer vision.

### `PATCH /api/alerts/ai/:alertId/verify`
Human-in-the-loop decision point. Revenue officer verifies or dismisses an alert.
- **Request:**
  ```json
  {
    "action": "verified",
    "remarks": "Field inspection confirmed construction on agricultural land."
  }
  ```

---

## 4. Citizen Applications (`/api/applications`)

### `POST /api/applications`
Citizen submits a statutory service application (e.g. mutation, RoR copy, NEC).
- **Request:**
  ```json
  {
    "service_type": "mutation",
    "parcel_id": "uuid-optional",
    "description": "Mutation following registered sale deed execution."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "application_no": "LS-2026-000015",
      "status": "submitted"
    }
  }
  ```

### `PATCH /api/applications/:id/status`
Officer advances application workflow (`under_review`, `field_verification`, `approved`, `rejected`).
