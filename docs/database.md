# LANDSTACK — Database Schema & Spatial Design

## Overview
LANDSTACK runs on **PostgreSQL 18 + PostGIS 3.6**. PostGIS provides the foundational geospatial primitives required to store, index, query, and analyze cadastral parcel boundary geometries in standard WGS84 (`EPSG:4326`) and UTM projected coordinate systems (`EPSG:32644`).

---

## Core Tables

### 1. `parcels`
The master cadastral entity table.
- `parcel_id`: `UUID PRIMARY KEY`
- `ulpin`: `VARCHAR(14) UNIQUE NOT NULL` — Bhu-Aadhaar 14-digit standard
- `geometry`: `geometry(Polygon, 4326)` with spatial index `USING GIST(geometry)`
- `khasra_no`: `VARCHAR(50)`
- `plot_no`: `VARCHAR(50)`
- `land_use`: `VARCHAR(50)` (`agricultural`, `residential`, `commercial`, `industrial`, `forest`, `water_body`)
- `area_recorded`: `NUMERIC(12,2)` — area recorded in Revenue RoR
- `area_gis_computed`: `NUMERIC(12,2)` — area computed directly via `ST_Area(ST_Transform(geometry, 32644))`
- `area_mismatch_pct`: Computed delta percentage
- `has_overlap`: `BOOLEAN` — flagged when PostGIS `ST_Overlaps` detects intersection with another parcel

### 2. `rights_records` & `owners` (Revenue Dept)
Represents the Record of Rights (Khatian / RoR).
- `record_id`: `UUID PRIMARY KEY`
- `parcel_id`: `UUID REFERENCES parcels(parcel_id)`
- `owner_id`: `UUID REFERENCES owners(owner_id)`
- `ownership_share`: `NUMERIC(5,4)` (e.g., `0.5000` = 50% share)
- `ownership_type`: `VARCHAR(50)` (`individual`, `joint`, `trust`, `state`)
- `is_current`: `BOOLEAN DEFAULT TRUE`

### 3. `registrations` (IGRS / Deeds)
Registered sale deeds, gift deeds, partitions, and mortgages.
- `registration_id`: `UUID PRIMARY KEY`
- `parcel_id`: `UUID REFERENCES parcels(parcel_id)`
- `deed_no`: `VARCHAR(100) UNIQUE`
- `registration_date`: `DATE`
- `deed_type`: `VARCHAR(50)` (`sale`, `gift`, `partition`, `mortgage`)
- `market_value`: `NUMERIC(14,2)`
- `stamp_duty_paid`: `NUMERIC(12,2)`

### 4. `tax_records` & `building_permissions` (Municipality)
Municipal records linked to the parcel.
- Property tax assessment year, payment status, arrears.
- Building sanctions, FAR (Floor Area Ratio), sanctioned floors, permit numbers.

### 5. `ai_alerts` & `data_quality_alerts` (Intelligence Layer)
- `ai_alerts`: Stores satellite change detections, `confidence` score (0.00 to 1.00), `change_geometry`, `status` (`pending`, `verified`, `dismissed`), and `officer_remarks`.
- `data_quality_alerts`: Cross-department discrepancy records (e.g. area mismatch, missing mutations, overlaps).

### 6. `audit_logs` (Statutory Governance)
Immutable audit trail recording every state change:
- `user_id`, `action`, `table_name`, `record_id`, `old_value`, `new_value`, `change_reason`, `ip_address`, `created_at`.
