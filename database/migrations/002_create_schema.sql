-- Migration 002: Core LANDSTACK Schema
-- Creates all tables for the parcel-centric land governance system
-- Coordinate Reference System: SRID 4326 (WGS84) for storage

-- ═══════════════════════════════════════════════════════════════
-- SECTION 1: USER MANAGEMENT
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed base roles
INSERT INTO roles (role_name, description) VALUES
    ('admin',                  'Full system access and user management'),
    ('citizen',                'Public user - can search and submit applications'),
    ('revenue_officer',        'Revenue department - verify records, process mutations'),
    ('registration_officer',   'Registration department - view registration history'),
    ('municipality_officer',   'Municipality - process building permits and property tax'),
    ('survey_officer',         'Survey department - verify GIS geometry and boundaries')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    user_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role_id       INTEGER NOT NULL REFERENCES roles(role_id),
    department    VARCHAR(100),           -- for officer users
    employee_id   VARCHAR(50),            -- government employee ID
    is_active     BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 2: ADMINISTRATIVE HIERARCHY
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS states (
    state_id    SERIAL PRIMARY KEY,
    state_code  VARCHAR(5) UNIQUE NOT NULL,   -- e.g., 'WB', 'MH'
    state_name  VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS districts (
    district_id   SERIAL PRIMARY KEY,
    state_id      INTEGER NOT NULL REFERENCES states(state_id),
    district_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'DGP', 'PNE'
    district_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS blocks (
    block_id    SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(district_id),
    block_name  VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS villages (
    village_id   SERIAL PRIMARY KEY,
    block_id     INTEGER NOT NULL REFERENCES blocks(block_id),
    village_name VARCHAR(100) NOT NULL,
    mouza_name   VARCHAR(100),   -- Revenue village name in Bengali
    lgd_code     VARCHAR(20)     -- Local Government Directory code
);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 3: CORE PARCEL TABLE
-- This is the heart of LANDSTACK
-- ULPIN is the universal identifier that links everything
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS parcels (
    parcel_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ulpin          VARCHAR(20) UNIQUE NOT NULL,  -- e.g., WB-DGP-00012345
    
    -- Administrative location
    state_id       INTEGER REFERENCES states(state_id),
    district_id    INTEGER REFERENCES districts(district_id),
    village_id     INTEGER REFERENCES villages(village_id),
    
    -- Local identifiers (source-system terminology preserved)
    khasra_no      VARCHAR(50),    -- Revenue: Khasra/Dag/Survey number
    plot_no        VARCHAR(50),    -- Municipal plot number
    survey_no      VARCHAR(50),    -- Survey department number
    
    -- Area information
    area_recorded  NUMERIC(12,4),  -- Area from revenue records (sq meters)
    area_gis       NUMERIC(12,4),  -- Area calculated from GIS geometry (sq meters)
    area_unit      VARCHAR(20) DEFAULT 'sqm',
    
    -- Land classification
    land_use       VARCHAR(50),    -- agricultural, residential, commercial, industrial, forest, govt
    land_type      VARCHAR(50),    -- wet, dry, garden, homestead, etc.
    zoning         VARCHAR(50),    -- residential, commercial, mixed-use, industrial, green-zone
    
    -- GIS geometry: POLYGON stored as WGS84 (SRID 4326)
    -- PostGIS geometry type ensures valid spatial operations
    geometry       GEOMETRY(POLYGON, 4326) NOT NULL,
    
    -- Data quality
    geometry_verified   BOOLEAN DEFAULT FALSE,
    area_mismatch_pct   NUMERIC(6,2),    -- percentage difference between recorded and GIS area
    has_overlap         BOOLEAN DEFAULT FALSE,
    
    -- Source attribution
    source_system       VARCHAR(50) DEFAULT 'synthetic',
    last_synced_at      TIMESTAMPTZ,
    
    -- Status
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index: Critical for all map queries and spatial operations
-- This is what makes ST_Intersects, ST_Within, ST_DWithin fast
CREATE INDEX IF NOT EXISTS idx_parcels_geometry ON parcels USING GIST(geometry);

-- Regular indexes for common searches
CREATE INDEX IF NOT EXISTS idx_parcels_ulpin ON parcels(ulpin);
CREATE INDEX IF NOT EXISTS idx_parcels_khasra ON parcels(khasra_no);
CREATE INDEX IF NOT EXISTS idx_parcels_district ON parcels(district_id);
CREATE INDEX IF NOT EXISTS idx_parcels_village ON parcels(village_id);
CREATE INDEX IF NOT EXISTS idx_parcels_land_use ON parcels(land_use);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 4: PARCEL VERSION HISTORY
-- Track changes to parcel boundaries over time (subdivision, merger)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS parcel_versions (
    version_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id     UUID NOT NULL REFERENCES parcels(parcel_id),
    version_no    INTEGER NOT NULL,
    change_type   VARCHAR(50),   -- 'boundary_update', 'subdivision', 'merger'
    geometry_old  GEOMETRY(POLYGON, 4326),
    geometry_new  GEOMETRY(POLYGON, 4326),
    changed_by    UUID REFERENCES users(user_id),
    change_reason TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcel_versions_parcel ON parcel_versions(parcel_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 5: OWNERSHIP RECORDS (Revenue Department)
-- RoR = Record of Rights
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS owners (
    owner_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name    VARCHAR(255) NOT NULL,
    father_name  VARCHAR(255),
    aadhaar_hash VARCHAR(64),    -- Hashed, never stored plain
    pan_hash     VARCHAR(64),    -- Hashed, never stored plain
    address      TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rights_records (
    ror_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id       UUID NOT NULL REFERENCES parcels(parcel_id),
    owner_id        UUID NOT NULL REFERENCES owners(owner_id),
    ownership_share NUMERIC(5,4) DEFAULT 1.0,   -- fractional share (1.0 = 100%)
    ownership_type  VARCHAR(50),                -- sole, joint, inherited
    effective_from  DATE NOT NULL,
    effective_to    DATE,                       -- NULL = currently active
    is_current      BOOLEAN DEFAULT TRUE,
    
    -- Source attribution (interoperability)
    source_system      VARCHAR(50) DEFAULT 'revenue',
    source_record_id   VARCHAR(100),
    source_field_map   JSONB,   -- maps source terminology to common model
    
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ror_parcel ON rights_records(parcel_id);
CREATE INDEX IF NOT EXISTS idx_ror_owner ON rights_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_ror_current ON rights_records(parcel_id) WHERE is_current = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- SECTION 6: MUTATIONS (Change of ownership records)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mutations (
    mutation_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id        UUID NOT NULL REFERENCES parcels(parcel_id),
    mutation_no      VARCHAR(50),
    mutation_type    VARCHAR(50),  -- sale, inheritance, gift, partition, court_order
    previous_owner   UUID REFERENCES owners(owner_id),
    new_owner        UUID REFERENCES owners(owner_id),
    mutation_date    DATE,
    registration_ref VARCHAR(100),
    officer_id       UUID REFERENCES users(user_id),
    remarks          TEXT,
    status           VARCHAR(30) DEFAULT 'pending', -- pending, approved, rejected
    source_system    VARCHAR(50) DEFAULT 'revenue',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mutations_parcel ON mutations(parcel_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 7: REGISTRATIONS (Registration Department)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS registrations (
    registration_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id         UUID NOT NULL REFERENCES parcels(parcel_id),
    deed_no           VARCHAR(100) UNIQUE,
    deed_type         VARCHAR(50),   -- sale_deed, gift_deed, mortgage, lease, partition
    registration_date DATE,
    seller_name       VARCHAR(255),
    buyer_name        VARCHAR(255),
    consideration_amt NUMERIC(15,2), -- transaction amount
    stamp_duty_paid   NUMERIC(12,2),
    sro_office        VARCHAR(100),  -- Sub-Registrar Office
    
    -- Source attribution
    source_system     VARCHAR(50) DEFAULT 'registration',
    source_record_id  VARCHAR(100),
    
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_parcel ON registrations(parcel_id);
CREATE INDEX IF NOT EXISTS idx_registrations_deed ON registrations(deed_no);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 8: PROPERTY TAX (Municipality Department)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tax_records (
    tax_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id        UUID NOT NULL REFERENCES parcels(parcel_id),
    assessment_year  VARCHAR(10) NOT NULL,   -- e.g., '2025-26'
    assessed_value   NUMERIC(15,2),
    annual_tax       NUMERIC(10,2),
    paid_amount      NUMERIC(10,2) DEFAULT 0,
    due_amount       NUMERIC(10,2),
    payment_date     DATE,
    payment_status   VARCHAR(20) DEFAULT 'pending', -- paid, pending, overdue, exempt
    arrears_amt      NUMERIC(10,2) DEFAULT 0,
    
    -- Source attribution
    source_system    VARCHAR(50) DEFAULT 'municipality',
    
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_parcel ON tax_records(parcel_id);
CREATE INDEX IF NOT EXISTS idx_tax_year ON tax_records(assessment_year);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 9: BUILDING PERMISSIONS (Municipality Department)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS building_permissions (
    permission_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id        UUID NOT NULL REFERENCES parcels(parcel_id),
    permit_no        VARCHAR(100),
    permit_type      VARCHAR(50),  -- new_construction, extension, renovation, demolition
    applicant_name   VARCHAR(255),
    approved_area    NUMERIC(10,2),  -- approved built-up area in sqm
    floors_approved  INTEGER,
    approval_date    DATE,
    expiry_date      DATE,
    status           VARCHAR(30),   -- approved, rejected, pending, expired, revoked
    
    -- Source attribution
    source_system    VARCHAR(50) DEFAULT 'municipality',
    source_record_id VARCHAR(100),
    
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permissions_parcel ON building_permissions(parcel_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 10: LAND USE / ZONING (Planning Department)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS zoning_records (
    zoning_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id      UUID NOT NULL REFERENCES parcels(parcel_id),
    zone_type      VARCHAR(50),    -- residential, commercial, industrial, agricultural, green
    fsi            NUMERIC(4,2),   -- Floor Space Index (development potential)
    setback_front  NUMERIC(6,2),   -- Front setback in meters
    setback_rear   NUMERIC(6,2),
    effective_from DATE,
    plan_name      VARCHAR(200),   -- Master Plan / Development Plan name
    plan_year      VARCHAR(10),
    source_system  VARCHAR(50) DEFAULT 'planning',
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zoning_parcel ON zoning_records(parcel_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 11: DISPUTES AND ENCUMBRANCES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS disputes (
    dispute_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id     UUID NOT NULL REFERENCES parcels(parcel_id),
    dispute_type  VARCHAR(50),   -- ownership, boundary, encroachment, title
    court         VARCHAR(200),
    case_no       VARCHAR(100),
    filed_date    DATE,
    status        VARCHAR(30),   -- active, resolved, dismissed, appealed
    description   TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_parcel ON disputes(parcel_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 12: DOCUMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documents (
    document_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id       UUID REFERENCES parcels(parcel_id),
    application_id  UUID,          -- Will reference applications table
    uploaded_by     UUID REFERENCES users(user_id),
    document_type   VARCHAR(50),   -- ror, deed, permit, id_proof, survey_map
    file_name       VARCHAR(255),
    file_path       TEXT,
    file_size_bytes INTEGER,
    mime_type       VARCHAR(100),
    is_verified     BOOLEAN DEFAULT FALSE,
    verified_by     UUID REFERENCES users(user_id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_parcel ON documents(parcel_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 13: CITIZEN APPLICATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS applications (
    application_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_no    VARCHAR(20) UNIQUE NOT NULL,  -- Human-readable: LS-2026-000001
    parcel_id         UUID REFERENCES parcels(parcel_id),
    applicant_id      UUID NOT NULL REFERENCES users(user_id),
    service_type      VARCHAR(50) NOT NULL,  -- mutation, ror_copy, encumbrance_cert, name_correction, grievance
    description       TEXT,
    status            VARCHAR(30) DEFAULT 'submitted',
    assigned_to       UUID REFERENCES users(user_id),
    priority          VARCHAR(10) DEFAULT 'normal',  -- normal, urgent
    submitted_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at       TIMESTAMPTZ,
    due_date          DATE
);

CREATE INDEX IF NOT EXISTS idx_applications_parcel ON applications(parcel_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Generate application numbers: LS-YYYY-NNNNNN
CREATE SEQUENCE IF NOT EXISTS application_seq START 1;

CREATE TABLE IF NOT EXISTS application_status_history (
    history_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES applications(application_id),
    old_status      VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    changed_by      UUID REFERENCES users(user_id),
    remarks         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_history_app ON application_status_history(application_id);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 14: AI AND DATA QUALITY ALERTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS data_quality_alerts (
    alert_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id      UUID NOT NULL REFERENCES parcels(parcel_id),
    alert_type     VARCHAR(50) NOT NULL,  -- area_mismatch, overlap, missing_ror, missing_permit, duplicate
    severity       VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    description    TEXT NOT NULL,
    details        JSONB,          -- structured alert details
    status         VARCHAR(20) DEFAULT 'open',  -- open, acknowledged, resolved, dismissed
    detected_at    TIMESTAMPTZ DEFAULT NOW(),
    resolved_at    TIMESTAMPTZ,
    resolved_by    UUID REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_dqa_parcel ON data_quality_alerts(parcel_id);
CREATE INDEX IF NOT EXISTS idx_dqa_status ON data_quality_alerts(status);
CREATE INDEX IF NOT EXISTS idx_dqa_type ON data_quality_alerts(alert_type);

CREATE TABLE IF NOT EXISTS ai_alerts (
    alert_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id      UUID REFERENCES parcels(parcel_id),
    alert_type     VARCHAR(50) NOT NULL,  -- land_use_change, new_structure, boundary_encroachment
    confidence     NUMERIC(5,4),          -- 0.0 to 1.0
    description    TEXT NOT NULL,
    evidence_data  JSONB,                 -- image paths, bounding boxes, etc.
    affected_area  NUMERIC(12,4),         -- sq meters of detected change
    change_geometry GEOMETRY(POLYGON, 4326),  -- geometry of detected change
    status         VARCHAR(20) DEFAULT 'pending', -- pending, verified, dismissed, escalated
    detected_at    TIMESTAMPTZ DEFAULT NOW(),
    verified_at    TIMESTAMPTZ,
    verified_by    UUID REFERENCES users(user_id),
    officer_remarks TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_alerts_parcel ON ai_alerts(parcel_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_status ON ai_alerts(status);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_geometry ON ai_alerts USING GIST(change_geometry);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 15: COMMON DATA MODEL MAPPING
-- Preserves source-system terminology while mapping to common concepts
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS terminology_map (
    map_id          SERIAL PRIMARY KEY,
    source_system   VARCHAR(50) NOT NULL,   -- revenue_wb, revenue_mh, registration_igrs
    source_term     VARCHAR(100) NOT NULL,  -- khasra, dag, survey_number
    common_concept  VARCHAR(100) NOT NULL,  -- parcel_number
    common_label    VARCHAR(100),           -- 'Plot / Survey Number'
    state_code      VARCHAR(5),             -- applies to specific state or NULL for all
    notes           TEXT
);

-- Insert terminology mappings for common Indian land record terms
INSERT INTO terminology_map (source_system, source_term, common_concept, common_label, state_code, notes) VALUES
    -- Parcel identifiers
    ('revenue_wb',  'dag_no',     'parcel_number', 'Plot / Dag Number',    'WB', 'West Bengal revenue number'),
    ('revenue_wb',  'khatian_no', 'rights_record', 'Khatian Number',       'WB', 'West Bengal RoR equivalent'),
    ('revenue_mh',  'survey_no',  'parcel_number', 'Survey Number',        'MH', 'Maharashtra survey number'),
    ('revenue_ka',  'survey_no',  'parcel_number', 'Survey Number',        'KA', 'Karnataka survey number'),
    ('revenue_up',  'khasra_no',  'parcel_number', 'Khasra Number',        'UP', 'Uttar Pradesh khasra'),
    ('revenue_rj',  'khasra_no',  'parcel_number', 'Khasra Number',        'RJ', 'Rajasthan khasra'),
    ('revenue_tn',  'patta_no',   'parcel_number', 'Patta Number',         'TN', 'Tamil Nadu patta'),
    ('revenue_ka',  'rtc_no',     'rights_record', 'RTC Number',           'KA', 'Karnataka RTC (pahani)'),
    -- Administrative names
    ('revenue_wb',  'mouza',      'village',       'Revenue Village',      'WB', 'West Bengal revenue village'),
    ('revenue_mh',  'gut',        'sub_parcel',    'Gut Number',           'MH', 'Maharashtra sub-survey'),
    -- Owner records
    ('revenue_any', 'ror',        'rights_record', 'Record of Rights',     NULL, 'Universal RoR'),
    ('revenue_wb',  'khatian',    'rights_record', 'Khatian',              'WB', 'WB rights record'),
    ('revenue_tn',  'chitta',     'rights_record', 'Chitta',               'TN', 'TN rights record')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SECTION 16: AUDIT TRAIL
-- WHO did WHAT to WHICH record, WHEN, and WHY
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(user_id),
    action        VARCHAR(50) NOT NULL,    -- CREATE, UPDATE, DELETE, VIEW_SENSITIVE, VERIFY_ALERT
    table_name    VARCHAR(50),
    record_id     UUID,
    field_name    VARCHAR(100),
    old_value     TEXT,
    new_value     TEXT,
    change_reason TEXT,
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- SECTION 17: SCHEMA MANAGEMENT
-- Track which migrations have been applied
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_id  VARCHAR(50) PRIMARY KEY,
    applied_at    TIMESTAMPTZ DEFAULT NOW(),
    description   TEXT
);

INSERT INTO schema_migrations (migration_id, description) VALUES
    ('002_create_schema', 'Core LANDSTACK schema: users, parcels, rights, registrations, tax, permits, AI alerts, audit')
ON CONFLICT (migration_id) DO NOTHING;
