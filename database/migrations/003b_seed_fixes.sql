-- Migration 003b: Fix remaining seeds (disputes, alerts, users)
-- Fixes reserved-word issue with 'desc' column alias

-- ═══════════════════════════════════════════════════════════════
-- Disputes
-- ═══════════════════════════════════════════════════════════════

INSERT INTO disputes (parcel_id, dispute_type, court, case_no, filed_date, status, description)
SELECT p.parcel_id, d.dtype, d.court_name, d.case_no, d.fdate::DATE, d.dstatus, d.ddesc
FROM (VALUES
    ('WB-DGP-00000008','boundary',    'Civil Judge Court, Durgapur', 'CJD-2021-445','2021-08-15','active',   'Disputed boundary between parcels 8 and 9'),
    ('WB-DGP-00000009','boundary',    'Civil Judge Court, Durgapur', 'CJD-2021-445','2021-08-15','active',   'Disputed boundary between parcels 8 and 9'),
    ('WB-DGP-00000013','ownership',   'District Court, Bardhaman',   'DCB-2023-112','2023-03-20','active',   'Ownership disputed by heir of previous owner'),
    ('WB-DGP-00000018','encroachment','Revenue Court, Kanksa',       'RCK-2024-033','2024-01-10','active',   'Alleged encroachment on adjacent agricultural land')
) AS d(ulpin, dtype, court_name, case_no, fdate, dstatus, ddesc)
JOIN parcels p ON p.ulpin = d.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Data Quality Alerts
-- ═══════════════════════════════════════════════════════════════

INSERT INTO data_quality_alerts (parcel_id, alert_type, severity, description, details)
SELECT p.parcel_id, a.atype, a.aseverity, a.adesc, a.details::JSONB
FROM (VALUES
    ('WB-DGP-00000002','area_mismatch','high',
     'Recorded area (1800 m²) differs from GIS area (2124 m²) by 18%. Verification required.',
     '{"recorded_area": 1800, "gis_area": 2124, "difference_pct": 18, "threshold_pct": 5}'),

    ('WB-DGP-00000008','overlap','high',
     'Parcel WB-DGP-00000008 overlaps with WB-DGP-00000009. Possible boundary demarcation error.',
     '{"overlapping_ulpin": "WB-DGP-00000009", "overlap_area_sqm": 145.2}'),

    ('WB-DGP-00000009','overlap','high',
     'Parcel WB-DGP-00000009 overlaps with WB-DGP-00000008. Possible boundary demarcation error.',
     '{"overlapping_ulpin": "WB-DGP-00000008", "overlap_area_sqm": 145.2}'),

    ('WB-DGP-00000013','area_mismatch','critical',
     'Recorded area (800 m²) differs from GIS area (1040 m²) by 30%. Large discrepancy requires field verification.',
     '{"recorded_area": 800, "gis_area": 1040, "difference_pct": 30, "threshold_pct": 5}'),

    ('WB-DGP-00000013','missing_permit','high',
     'No building permission on record for this parcel, but structure appears to exist.',
     '{"last_checked": "2026-09-14", "structure_detected_by": "field_survey"}'),

    ('WB-DGP-00000018','missing_mutation','medium',
     'Sale deed registered (2015) but no corresponding mutation filed in revenue records.',
     '{"deed_no": "WB-DGP-DEED-2015-000701", "deed_date": "2015-09-01", "mutation_expected_by": "2015-12-01"}'),

    ('WB-DGP-00000006','tax_overdue','medium',
     'Property tax overdue for 2 years. Total arrears: 12800',
     '{"arrears_amount": 12800, "years_overdue": 2, "last_paid_year": "2023-24"}')
) AS a(ulpin, atype, aseverity, adesc, details)
JOIN parcels p ON p.ulpin = a.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- AI Alerts
-- ═══════════════════════════════════════════════════════════════

INSERT INTO ai_alerts (parcel_id, alert_type, confidence, description, evidence_data, affected_area, change_geometry, status)
SELECT p.parcel_id, a.atype, a.conf, a.adesc, a.evidence::JSONB, a.area,
       ST_GeomFromText(a.geom, 4326), a.astatus
FROM (VALUES
    ('WB-DGP-00000013','new_structure', 0.87,
     'Potential new structure detected. Verification required — no building permission on record.',
     '{"image_before": "synthetic/simulia_2024_jan.png", "image_after": "synthetic/simulia_2026_aug.png", "change_type": "new_structure", "pixels_changed": 1240}',
     180.50,
     'POLYGON((87.3140 23.5252, 87.3148 23.5252, 87.3148 23.5260, 87.3140 23.5260, 87.3140 23.5252))',
     'pending'),

    ('WB-DGP-00000018','land_use_change', 0.91,
     'Potential land-use change from agricultural to construction activity detected. Agricultural zone — verification required.',
     '{"image_before": "synthetic/dhemain_2024_jan.png", "image_after": "synthetic/dhemain_2026_aug.png", "change_type": "construction", "pixels_changed": 3560}',
     520.00,
     'POLYGON((87.3140 23.5315, 87.3162 23.5315, 87.3162 23.5332, 87.3140 23.5332, 87.3140 23.5315))',
     'pending'),

    ('WB-DGP-00000020','encroachment', 0.73,
     'Potential encroachment on forest/green-zone parcel detected. Verification required.',
     '{"image_before": "synthetic/balarampur_2024_jan.png", "image_after": "synthetic/balarampur_2026_aug.png", "change_type": "clearing", "pixels_changed": 890}',
     95.00,
     'POLYGON((87.3302 23.5285, 87.3315 23.5285, 87.3315 23.5295, 87.3302 23.5295, 87.3302 23.5285))',
     'pending')
) AS a(ulpin, atype, conf, adesc, evidence, area, geom, astatus)
JOIN parcels p ON p.ulpin = a.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Users (password hashes will be updated at first startup)
-- These are placeholder hashes — backend seeds real bcrypt hashes
-- ═══════════════════════════════════════════════════════════════

-- Temporarily insert with a clearly marked placeholder
-- The backend startup script will hash properly
INSERT INTO users (email, password_hash, full_name, phone, role_id, department, employee_id, is_active)
SELECT u.email, u.phash, u.fname, u.phone,
       (SELECT role_id FROM roles WHERE role_name = u.urole),
       u.dept, u.empid, TRUE
FROM (VALUES
    ('admin@landstack.gov',       'PLACEHOLDER_HASH_RESET_ON_FIRST_RUN', 'System Administrator',  '9000000001', 'admin',                'IT Department',    'ADM-001'),
    ('revenue@wb.gov',            'PLACEHOLDER_HASH_RESET_ON_FIRST_RUN', 'Rajesh Patel',          '9000000002', 'revenue_officer',      'Revenue Dept WB',  'REV-DGP-042'),
    ('registration@wb.gov',       'PLACEHOLDER_HASH_RESET_ON_FIRST_RUN', 'Kavita Sharma',         '9000000003', 'registration_officer', 'Registration Dept','REG-DGP-015'),
    ('municipality@durgapur.gov', 'PLACEHOLDER_HASH_RESET_ON_FIRST_RUN', 'Sanjay Mukherjee',      '9000000004', 'municipality_officer', 'Durgapur MC',      'MUN-DGP-007'),
    ('survey@wb.gov',             'PLACEHOLDER_HASH_RESET_ON_FIRST_RUN', 'Amit Dutta',            '9000000005', 'survey_officer',       'Survey Dept WB',   'SRV-DGP-023'),
    ('citizen@demo.com',          'PLACEHOLDER_HASH_RESET_ON_FIRST_RUN', 'Ravi Kumar Sharma',     '9876543210', 'citizen',              NULL,               NULL)
) AS u(email, phash, fname, phone, urole, dept, empid)
ON CONFLICT (email) DO NOTHING;

INSERT INTO schema_migrations (migration_id, description) VALUES
    ('003b_seed_fixes', 'Fixed reserved word issues in seed data; added disputes, alerts, and placeholder users')
ON CONFLICT (migration_id) DO NOTHING;
