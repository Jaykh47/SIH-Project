-- Migration 003: Synthetic Data Seeds
-- Creates realistic synthetic data for LANDSTACK prototype demonstration
-- ⚠️ ALL DATA IS SYNTHETIC — NOT REAL GOVERNMENT RECORDS

-- ═══════════════════════════════════════════════════════════════
-- Administrative Hierarchy: West Bengal (Demo Region)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO states (state_code, state_name) VALUES
    ('WB', 'West Bengal'),
    ('MH', 'Maharashtra'),
    ('KA', 'Karnataka')
ON CONFLICT (state_code) DO NOTHING;

INSERT INTO districts (state_id, district_code, district_name)
SELECT s.state_id, d.code, d.name
FROM states s
JOIN (VALUES
    ('WB', 'DGP', 'Durgapur-Asansol'),
    ('WB', 'BRD', 'Bardhaman'),
    ('WB', 'HGL', 'Hooghly'),
    ('MH', 'PNE', 'Pune'),
    ('KA', 'BLR', 'Bengaluru Urban')
) AS d(state_code, code, name) ON s.state_code = d.state_code
ON CONFLICT (district_code) DO NOTHING;

-- Blocks under WB-DGP
INSERT INTO blocks (district_id, block_name)
SELECT d.district_id, b.name
FROM districts d
JOIN (VALUES
    ('DGP', 'Kanksa'),
    ('DGP', 'Faridpur-Durgapur'),
    ('DGP', 'Ausgram-I')
) AS b(dist_code, name) ON d.district_code = b.dist_code;

-- Villages under Kanksa block
INSERT INTO villages (block_id, village_name, mouza_name, lgd_code)
SELECT b.block_id, v.name, v.mouza, v.lgd
FROM blocks b
JOIN (VALUES
    ('Kanksa', 'Simulia',    'Simulia Mouza',    'WB123001'),
    ('Kanksa', 'Bamunara',   'Bamunara Mouza',   'WB123002'),
    ('Kanksa', 'Joymura',    'Joymura Mouza',    'WB123003'),
    ('Kanksa', 'Dhemain',    'Dhemain Mouza',    'WB123004'),
    ('Kanksa', 'Balarampur', 'Balarampur Mouza', 'WB123005')
) AS v(block_name, name, mouza, lgd) ON b.block_name = v.block_name;

-- ═══════════════════════════════════════════════════════════════
-- Synthetic Parcels with GIS Geometry
-- Location: Near Durgapur, West Bengal (real coordinates, synthetic parcels)
-- SRID 4326 (WGS84) — all coordinates are longitude, latitude
-- ═══════════════════════════════════════════════════════════════

-- Helper: create parcel geometry as polygon given center point and size
-- We manually define realistic polygon boundaries

-- Insert 20 synthetic parcels across 4 villages
-- Parcels are placed in the Durgapur area (~23.5°N, 87.3°E)

INSERT INTO parcels (
    ulpin, state_id, district_id, village_id, khasra_no, plot_no, survey_no,
    area_recorded, area_gis, land_use, land_type, zoning,
    geometry, source_system, last_synced_at,
    area_mismatch_pct, has_overlap
)
SELECT
    p.ulpin,
    (SELECT state_id FROM states WHERE state_code = 'WB'),
    (SELECT district_id FROM districts WHERE district_code = 'DGP'),
    (SELECT village_id FROM villages WHERE village_name = p.village LIMIT 1),
    p.khasra, p.plot_no, p.survey_no,
    p.area_rec, p.area_gis,
    p.land_use, p.land_type, p.zoning,
    ST_GeomFromText(p.geom_wkt, 4326),
    'synthetic', NOW(),
    ROUND(ABS(p.area_rec - p.area_gis) / NULLIF(p.area_rec, 0) * 100, 2),
    p.has_overlap
FROM (VALUES
    -- ULPIN,          Village,     Khasra, Plot,  Survey, RecArea, GISArea, LandUse,       LandType,    Zoning,       HasOverlap, Geom WKT
    ('WB-DGP-00000001','Simulia',   '101/1','P-01','S-101', 2500.00, 2487.50,'agricultural','wet',        'agricultural',FALSE,
     'POLYGON((87.3100 23.5200, 87.3115 23.5200, 87.3115 23.5215, 87.3100 23.5215, 87.3100 23.5200))'),

    ('WB-DGP-00000002','Simulia',   '101/2','P-02','S-102', 1800.00, 2124.00,'residential', 'homestead',  'residential', FALSE,
     'POLYGON((87.3115 23.5200, 87.3128 23.5200, 87.3128 23.5213, 87.3115 23.5213, 87.3115 23.5200))'),
    -- ^ Area mismatch: recorded 1800 but GIS shows 2124 (18% difference) → DATA QUALITY ALERT

    ('WB-DGP-00000003','Simulia',   '102/1','P-03','S-103', 3200.00, 3198.40,'agricultural','dry',         'agricultural',FALSE,
     'POLYGON((87.3128 23.5200, 87.3148 23.5200, 87.3148 23.5218, 87.3128 23.5218, 87.3128 23.5200))'),

    ('WB-DGP-00000004','Simulia',   '102/2','P-04','S-104', 950.00,  950.50, 'residential', 'homestead',  'residential', FALSE,
     'POLYGON((87.3100 23.5215, 87.3113 23.5215, 87.3113 23.5225, 87.3100 23.5225, 87.3100 23.5215))'),

    ('WB-DGP-00000005','Simulia',   '103/1','P-05','S-105', 5000.00, 5012.00,'commercial',  'commercial', 'commercial',  FALSE,
     'POLYGON((87.3113 23.5215, 87.3135 23.5215, 87.3135 23.5233, 87.3113 23.5233, 87.3113 23.5215))'),

    ('WB-DGP-00000006','Bamunara',  '201/1','P-06','S-201', 4200.00, 4198.80,'agricultural','wet',         'agricultural',FALSE,
     'POLYGON((87.3200 23.5200, 87.3225 23.5200, 87.3225 23.5218, 87.3200 23.5218, 87.3200 23.5200))'),

    ('WB-DGP-00000007','Bamunara',  '201/2','P-07','S-202', 1200.00, 1199.20,'residential', 'homestead',  'residential', FALSE,
     'POLYGON((87.3225 23.5200, 87.3236 23.5200, 87.3236 23.5211, 87.3225 23.5211, 87.3225 23.5200))'),

    -- Overlapping parcels (intentional data quality issue)
    ('WB-DGP-00000008','Bamunara',  '202/1','P-08','S-203', 2800.00, 2801.60,'agricultural','dry',         'agricultural',TRUE,
     'POLYGON((87.3236 23.5198, 87.3258 23.5198, 87.3258 23.5216, 87.3236 23.5216, 87.3236 23.5198))'),

    ('WB-DGP-00000009','Bamunara',  '202/2','P-09','S-204', 1600.00, 1598.80,'agricultural','dry',         'agricultural',TRUE,
     'POLYGON((87.3252 23.5198, 87.3270 23.5198, 87.3270 23.5213, 87.3252 23.5213, 87.3252 23.5198))'),
    -- ^ Overlaps with parcel 8 → OVERLAP ALERT

    ('WB-DGP-00000010','Bamunara',  '203/1','P-10','S-205', 6800.00, 6795.20,'industrial',  'industrial', 'industrial',  FALSE,
     'POLYGON((87.3270 23.5198, 87.3310 23.5198, 87.3310 23.5235, 87.3270 23.5235, 87.3270 23.5198))'),

    ('WB-DGP-00000011','Joymura',   '301/1','P-11','S-301', 3500.00, 3501.40,'agricultural','wet',         'agricultural',FALSE,
     'POLYGON((87.3100 23.5250, 87.3122 23.5250, 87.3122 23.5270, 87.3100 23.5270, 87.3100 23.5250))'),

    ('WB-DGP-00000012','Joymura',   '301/2','P-12','S-302', 2100.00, 2098.80,'residential', 'homestead',  'residential', FALSE,
     'POLYGON((87.3122 23.5250, 87.3138 23.5250, 87.3138 23.5264, 87.3122 23.5264, 87.3122 23.5250))'),

    -- Parcel with large area mismatch AND missing building permit
    ('WB-DGP-00000013','Joymura',   '302/1','P-13','S-303', 800.00,  1040.00,'residential', 'homestead',  'residential', FALSE,
     'POLYGON((87.3138 23.5250, 87.3152 23.5250, 87.3152 23.5265, 87.3138 23.5265, 87.3138 23.5250))'),
    -- ^ Area mismatch 30%! AND AI detects new structure but no permit → MULTIPLE ALERTS

    ('WB-DGP-00000014','Joymura',   '302/2','P-14','S-304', 4500.00, 4498.20,'commercial',  'commercial', 'commercial',  FALSE,
     'POLYGON((87.3152 23.5250, 87.3185 23.5250, 87.3185 23.5278, 87.3152 23.5278, 87.3152 23.5250))'),

    ('WB-DGP-00000015','Joymura',   '303/1','P-15','S-305', 9200.00, 9198.40,'govt',        'govt',       'institutional',FALSE,
     'POLYGON((87.3185 23.5250, 87.3240 23.5250, 87.3240 23.5305, 87.3185 23.5305, 87.3185 23.5250))'),

    ('WB-DGP-00000016','Dhemain',   '401/1','P-16','S-401', 3100.00, 3098.80,'agricultural','wet',         'agricultural',FALSE,
     'POLYGON((87.3100 23.5310, 87.3122 23.5310, 87.3122 23.5330, 87.3100 23.5330, 87.3100 23.5310))'),

    ('WB-DGP-00000017','Dhemain',   '401/2','P-17','S-402', 1750.00, 1749.40,'residential', 'homestead',  'residential', FALSE,
     'POLYGON((87.3122 23.5310, 87.3135 23.5310, 87.3135 23.5323, 87.3122 23.5323, 87.3122 23.5310))'),

    -- Land use change candidate (originally agricultural, now showing construction)
    ('WB-DGP-00000018','Dhemain',   '402/1','P-18','S-403', 5500.00, 5498.40,'agricultural','dry',         'agricultural',FALSE,
     'POLYGON((87.3135 23.5310, 87.3170 23.5310, 87.3170 23.5345, 87.3135 23.5345, 87.3135 23.5310))'),
    -- ^ AI detects land-use change: agricultural → construction activity

    ('WB-DGP-00000019','Balarampur','501/1','P-19','S-501', 2400.00, 2398.60,'residential', 'homestead',  'residential', FALSE,
     'POLYGON((87.3280 23.5280, 87.3298 23.5280, 87.3298 23.5298, 87.3280 23.5298, 87.3280 23.5280))'),

    ('WB-DGP-00000020','Balarampur','501/2','P-20','S-502', 7500.00, 7496.80,'forest',      'forest',     'green-zone',  FALSE,
     'POLYGON((87.3298 23.5280, 87.3350 23.5280, 87.3350 23.5340, 87.3298 23.5340, 87.3298 23.5280))')
) AS p(ulpin, village, khasra, plot_no, survey_no, area_rec, area_gis, land_use, land_type, zoning, has_overlap, geom_wkt)
ON CONFLICT (ulpin) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Owners (Synthetic persons — NOT real people)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO owners (owner_id, full_name, father_name, address) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Ravi Kumar Sharma',    'Mohan Sharma',     'Simulia Village, Kanksa, Durgapur'),
    ('a1000000-0000-0000-0000-000000000002', 'Sita Devi Sharma',     'Ram Das',          'Simulia Village, Kanksa, Durgapur'),
    ('a1000000-0000-0000-0000-000000000003', 'Priya Basu',           'Subhas Basu',      'Bamunara, Durgapur'),
    ('a1000000-0000-0000-0000-000000000004', 'Dilip Roy',            'Haripada Roy',     'Bamunara, Durgapur'),
    ('a1000000-0000-0000-0000-000000000005', 'Anita Ghosh',          'Nirmal Ghosh',     'Joymura, Durgapur'),
    ('a1000000-0000-0000-0000-000000000006', 'Suresh Kumar Mondal',  'Kanailal Mondal',  'Joymura, Durgapur'),
    ('a1000000-0000-0000-0000-000000000007', 'Meena Roy',            'Binod Roy',        'Dhemain, Durgapur'),
    ('a1000000-0000-0000-0000-000000000008', 'Ashok Banerjee',       'Tapan Banerjee',   'Dhemain, Durgapur'),
    ('a1000000-0000-0000-0000-000000000009', 'Lakshmi Devi',         'Ramesh Das',       'Balarampur, Durgapur'),
    ('a1000000-0000-0000-0000-000000000010', 'West Bengal Govt',     'NA',               'Writers Building, Kolkata'),
    ('a1000000-0000-0000-0000-000000000011', 'Sandip Chakraborty',   'Nikhil Chakraborty','Simulia Village, Kanksa'),
    ('a1000000-0000-0000-0000-000000000012', 'Forest Department WB', 'NA',               'Aranya Bhawan, Kolkata')
ON CONFLICT (owner_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Rights Records (Ownership)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rights_records (parcel_id, owner_id, ownership_share, ownership_type, effective_from, is_current, source_system)
SELECT p.parcel_id, o.owner_id, r.share, r.otype, r.eff::DATE, TRUE, 'revenue_wb'
FROM (VALUES
    ('WB-DGP-00000001', 'a1000000-0000-0000-0000-000000000001', 1.0,  'sole',     '2015-03-12'),
    ('WB-DGP-00000002', 'a1000000-0000-0000-0000-000000000001', 0.5,  'joint',    '2015-03-12'),
    ('WB-DGP-00000002', 'a1000000-0000-0000-0000-000000000002', 0.5,  'joint',    '2015-03-12'),
    ('WB-DGP-00000003', 'a1000000-0000-0000-0000-000000000011', 1.0,  'sole',     '2018-07-22'),
    ('WB-DGP-00000004', 'a1000000-0000-0000-0000-000000000002', 1.0,  'sole',     '2012-11-05'),
    ('WB-DGP-00000005', 'a1000000-0000-0000-0000-000000000003', 1.0,  'sole',     '2020-01-15'),
    ('WB-DGP-00000006', 'a1000000-0000-0000-0000-000000000003', 1.0,  'sole',     '2014-06-30'),
    ('WB-DGP-00000007', 'a1000000-0000-0000-0000-000000000004', 1.0,  'sole',     '2019-09-18'),
    ('WB-DGP-00000008', 'a1000000-0000-0000-0000-000000000004', 0.5,  'joint',    '2010-04-01'),
    ('WB-DGP-00000008', 'a1000000-0000-0000-0000-000000000005', 0.5,  'joint',    '2010-04-01'),
    ('WB-DGP-00000009', 'a1000000-0000-0000-0000-000000000005', 1.0,  'sole',     '2013-12-20'),
    ('WB-DGP-00000010', 'a1000000-0000-0000-0000-000000000006', 1.0,  'sole',     '2021-03-01'),
    ('WB-DGP-00000011', 'a1000000-0000-0000-0000-000000000006', 1.0,  'sole',     '2016-08-14'),
    ('WB-DGP-00000012', 'a1000000-0000-0000-0000-000000000007', 1.0,  'sole',     '2017-02-28'),
    ('WB-DGP-00000013', 'a1000000-0000-0000-0000-000000000008', 1.0,  'sole',     '2022-06-10'),
    ('WB-DGP-00000014', 'a1000000-0000-0000-0000-000000000008', 1.0,  'sole',     '2019-11-30'),
    ('WB-DGP-00000015', 'a1000000-0000-0000-0000-000000000010', 1.0,  'govt',     '2005-01-01'),
    ('WB-DGP-00000016', 'a1000000-0000-0000-0000-000000000009', 1.0,  'sole',     '2011-05-20'),
    ('WB-DGP-00000017', 'a1000000-0000-0000-0000-000000000009', 1.0,  'sole',     '2023-01-15'),
    ('WB-DGP-00000018', 'a1000000-0000-0000-0000-000000000007', 1.0,  'sole',     '2015-09-01'),
    ('WB-DGP-00000019', 'a1000000-0000-0000-0000-000000000009', 1.0,  'sole',     '2018-03-25'),
    ('WB-DGP-00000020', 'a1000000-0000-0000-0000-000000000012', 1.0,  'govt',     '2000-01-01')
) AS r(ulpin, owner_uuid, share, otype, eff)
JOIN parcels p ON p.ulpin = r.ulpin
JOIN owners o ON o.owner_id = r.owner_uuid::UUID
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Registrations (Sale deeds — synthetic)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO registrations (parcel_id, deed_no, deed_type, registration_date, seller_name, buyer_name, consideration_amt, stamp_duty_paid, sro_office, source_system)
SELECT p.parcel_id, r.deed_no, r.dtype, r.rdate::DATE, r.seller, r.buyer, r.amt, r.stamp, r.sro, 'registration_wb'
FROM (VALUES
    ('WB-DGP-00000001','WB-DGP-DEED-2015-001234','sale_deed','2015-03-12','Mohan Sharma',         'Ravi Kumar Sharma',    850000,  51000, 'Durgapur SRO'),
    ('WB-DGP-00000002','WB-DGP-DEED-2015-001235','sale_deed','2015-03-12','Mohan Sharma',         'Ravi & Sita Sharma',   420000,  25200, 'Durgapur SRO'),
    ('WB-DGP-00000004','WB-DGP-DEED-2012-000892','sale_deed','2012-11-05','Tapas Kumar',          'Sita Devi Sharma',     280000,  16800, 'Durgapur SRO'),
    ('WB-DGP-00000005','WB-DGP-DEED-2020-002341','sale_deed','2020-01-15','Indra Das',            'Priya Basu',          1850000, 111000, 'Durgapur SRO'),
    ('WB-DGP-00000007','WB-DGP-DEED-2019-003012','sale_deed','2019-09-18','Madan Roy',            'Dilip Roy',            390000,  23400, 'Kanksa SRO'),
    ('WB-DGP-00000010','WB-DGP-DEED-2021-004102','sale_deed','2021-03-01','ABC Industries Ltd',   'Suresh Kumar Mondal', 4500000, 270000, 'Durgapur SRO'),
    ('WB-DGP-00000013','WB-DGP-DEED-2022-004567','sale_deed','2022-06-10','Meena Roy',            'Ashok Banerjee',       350000,  21000, 'Kanksa SRO'),
    -- Parcel 18: Sale happened but mutation NOT filed — intentional anomaly
    ('WB-DGP-00000018','WB-DGP-DEED-2015-000701','sale_deed','2015-09-01','Haripada Roy',         'Meena Roy',            480000,  28800, 'Durgapur SRO')
) AS r(ulpin, deed_no, dtype, rdate, seller, buyer, amt, stamp, sro)
JOIN parcels p ON p.ulpin = r.ulpin
ON CONFLICT (deed_no) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Tax Records
-- ═══════════════════════════════════════════════════════════════

INSERT INTO tax_records (parcel_id, assessment_year, assessed_value, annual_tax, paid_amount, due_amount, payment_status, arrears_amt, source_system)
SELECT p.parcel_id, t.yr, t.aval, t.atax, t.paid, t.due, t.status, t.arrears, 'municipality_dgp'
FROM (VALUES
    ('WB-DGP-00000001','2025-26', 850000,  8500,  8500,  0,    'paid',    0),
    ('WB-DGP-00000002','2025-26', 420000,  4200,  4200,  0,    'paid',    0),
    ('WB-DGP-00000003','2025-26', 320000,  3200,  3200,  0,    'paid',    0),
    ('WB-DGP-00000004','2025-26', 280000,  2800,  0,     2800, 'pending', 2800),
    ('WB-DGP-00000005','2025-26',1850000, 18500, 18500,  0,    'paid',    0),
    ('WB-DGP-00000006','2025-26', 640000,  6400,  0,     6400, 'overdue', 12800),  -- Has arrears!
    ('WB-DGP-00000007','2025-26', 390000,  3900,  3900,  0,    'paid',    0),
    ('WB-DGP-00000008','2025-26', 560000,  5600,  5600,  0,    'paid',    0),
    ('WB-DGP-00000009','2025-26', 320000,  3200,  3200,  0,    'paid',    0),
    ('WB-DGP-00000010','2025-26',4500000, 45000, 45000,  0,    'paid',    0),
    ('WB-DGP-00000011','2025-26', 700000,  7000,  7000,  0,    'paid',    0),
    ('WB-DGP-00000012','2025-26', 420000,  4200,  4200,  0,    'paid',    0),
    ('WB-DGP-00000013','2025-26', 350000,  3500,  0,     3500, 'pending', 0),
    ('WB-DGP-00000014','2025-26',1900000, 19000, 19000,  0,    'paid',    0),
    ('WB-DGP-00000016','2025-26', 620000,  6200,  6200,  0,    'paid',    0),
    ('WB-DGP-00000017','2025-26', 350000,  3500,  3500,  0,    'paid',    0),
    ('WB-DGP-00000018','2025-26', 480000,  4800,  0,     4800, 'overdue', 9600),   -- Overdue + arrears
    ('WB-DGP-00000019','2025-26', 480000,  4800,  4800,  0,    'paid',    0)
) AS t(ulpin, yr, aval, atax, paid, due, status, arrears)
JOIN parcels p ON p.ulpin = t.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Building Permissions
-- NOTE: Parcel 13 intentionally has NO building permit but AI detects construction
-- ═══════════════════════════════════════════════════════════════

INSERT INTO building_permissions (parcel_id, permit_no, permit_type, applicant_name, approved_area, floors_approved, approval_date, expiry_date, status, source_system)
SELECT p.parcel_id, b.pno, b.ptype, b.applicant, b.area, b.floors, b.adate::DATE, b.edate::DATE, b.status, 'municipality_dgp'
FROM (VALUES
    ('WB-DGP-00000002','DGP-BP-2016-0045','new_construction','Ravi Kumar Sharma',   120.00, 2,'2016-02-15','2019-02-14','approved'),
    ('WB-DGP-00000004','DGP-BP-2013-0012','new_construction','Sita Devi Sharma',     80.00, 1,'2013-06-20','2016-06-19','approved'),
    ('WB-DGP-00000005','DGP-BP-2020-0234','new_construction','Priya Basu',          500.00, 4,'2020-06-01','2023-05-31','approved'),
    ('WB-DGP-00000007','DGP-BP-2020-0089','new_construction','Dilip Roy',            95.00, 1,'2020-01-10','2023-01-09','approved'),
    ('WB-DGP-00000010','DGP-BP-2021-0345','new_construction','Suresh Kumar Mondal', 2000.00,3,'2021-07-15','2024-07-14','approved'),
    ('WB-DGP-00000012','DGP-BP-2018-0178','new_construction','Meena Roy',           110.00, 2,'2018-05-22','2021-05-21','approved'),
    ('WB-DGP-00000014','DGP-BP-2019-0267','new_construction','Ashok Banerjee',      750.00, 5,'2019-12-01','2022-11-30','approved')
    -- Parcel 13 (WB-DGP-00000013) intentionally has NO building permit
    -- Parcel 18 (WB-DGP-00000018) intentionally has NO building permit despite AI detection
) AS b(ulpin, pno, ptype, applicant, area, floors, adate, edate, status)
JOIN parcels p ON p.ulpin = b.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Zoning Records
-- ═══════════════════════════════════════════════════════════════

INSERT INTO zoning_records (parcel_id, zone_type, fsi, setback_front, effective_from, plan_name, plan_year, source_system)
SELECT p.parcel_id, z.ztype, z.fsi, z.setback, z.eff::DATE, z.plan, z.yr, 'planning_dgp'
FROM (VALUES
    ('WB-DGP-00000001','agricultural', 0.00, 0.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000002','residential',  1.50, 3.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000003','agricultural', 0.00, 0.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000004','residential',  1.50, 3.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000005','commercial',   2.50, 4.50, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000006','agricultural', 0.00, 0.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000007','residential',  1.50, 3.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000010','industrial',   2.00, 5.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000014','commercial',   2.50, 4.50, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000015','institutional',1.00, 5.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    ('WB-DGP-00000018','agricultural', 0.00, 0.00, '2015-01-01','Durgapur Development Plan 2025','2015'),
    -- ^ Agricultural zone but AI detects construction — land use violation alert
    ('WB-DGP-00000020','green-zone',   0.00, 0.00, '2015-01-01','Durgapur Development Plan 2025','2015')
) AS z(ulpin, ztype, fsi, setback, eff, plan, yr)
JOIN parcels p ON p.ulpin = z.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Disputes
-- ═══════════════════════════════════════════════════════════════

INSERT INTO disputes (parcel_id, dispute_type, court, case_no, filed_date, status, description)
SELECT p.parcel_id, d.dtype, d.court, d.case_no, d.fdate::DATE, d.status, d.desc
FROM (VALUES
    ('WB-DGP-00000008','boundary',   'Civil Judge Court, Durgapur', 'CJD-2021-445','2021-08-15','active',   'Disputed boundary between parcels 8 and 9'),
    ('WB-DGP-00000009','boundary',   'Civil Judge Court, Durgapur', 'CJD-2021-445','2021-08-15','active',   'Disputed boundary between parcels 8 and 9'),
    ('WB-DGP-00000013','ownership',  'District Court, Bardhaman',   'DCB-2023-112','2023-03-20','active',   'Ownership disputed by heir of previous owner'),
    ('WB-DGP-00000018','encroachment','Revenue Court, Kanksa',      'RCK-2024-033','2024-01-10','active',   'Alleged encroachment on adjacent agricultural land')
) AS d(ulpin, dtype, court, case_no, fdate, status, desc)
JOIN parcels p ON p.ulpin = d.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Data Quality Alerts (pre-seeded for demo)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO data_quality_alerts (parcel_id, alert_type, severity, description, details)
SELECT p.parcel_id, a.atype, a.severity, a.desc, a.details::JSONB
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

    ('WB-DGP-00000013','missing_permit',  'high',
     'No building permission on record for this parcel, but structure appears to exist.',
     '{"last_checked": "2026-09-14", "structure_detected_by": "field_survey"}'),

    ('WB-DGP-00000018','missing_mutation','medium',
     'Sale deed registered (2015) but no corresponding mutation filed in revenue records.',
     '{"deed_no": "WB-DGP-DEED-2015-000701", "deed_date": "2015-09-01", "mutation_expected_by": "2015-12-01"}'),

    ('WB-DGP-00000006','tax_overdue','medium',
     'Property tax overdue for 2 years. Total arrears: ₹12,800',
     '{"arrears_amount": 12800, "years_overdue": 2, "last_paid_year": "2023-24"}')
) AS a(ulpin, atype, severity, desc, details)
JOIN parcels p ON p.ulpin = a.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- AI Alerts (Change Detection — pre-seeded for demo)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO ai_alerts (parcel_id, alert_type, confidence, description, evidence_data, affected_area, change_geometry, status)
SELECT p.parcel_id, a.atype, a.conf, a.desc, a.evidence::JSONB, a.area,
       ST_GeomFromText(a.geom, 4326), a.status
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
) AS a(ulpin, atype, conf, desc, evidence, area, geom, status)
JOIN parcels p ON p.ulpin = a.ulpin
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- System Users (for demo login)
-- Passwords are bcrypt hashes — plain text for reference only in this comment:
-- admin@landstack.gov → password: Admin@123
-- officer@revenue.wb.gov → password: Officer@123
-- citizen@demo.com → password: Citizen@123
-- ═══════════════════════════════════════════════════════════════

-- We'll seed users with a placeholder hash — real hashes generated at first startup
-- Hash below = bcrypt of 'Admin@123' with 12 rounds (pre-computed)
INSERT INTO users (email, password_hash, full_name, phone, role_id, department, employee_id, is_active)
SELECT u.email, u.phash, u.fname, u.phone,
       (SELECT role_id FROM roles WHERE role_name = u.role),
       u.dept, u.empid, TRUE
FROM (VALUES
    ('admin@landstack.gov',       '$2b$12$LandStackAdminHashPlaceholderXXXXXXXXXXXX', 'System Administrator', '9000000001', 'admin',                'IT Department',    'ADM-001'),
    ('revenue@wb.gov',            '$2b$12$LandStackAdminHashPlaceholderXXXXXXXXXXXX', 'Rajesh Patel',         '9000000002', 'revenue_officer',      'Revenue Dept WB',  'REV-DGP-042'),
    ('registration@wb.gov',       '$2b$12$LandStackAdminHashPlaceholderXXXXXXXXXXXX', 'Kavita Sharma',        '9000000003', 'registration_officer', 'Registration Dept','REG-DGP-015'),
    ('municipality@durgapur.gov', '$2b$12$LandStackAdminHashPlaceholderXXXXXXXXXXXX', 'Sanjay Mukherjee',     '9000000004', 'municipality_officer', 'Durgapur MC',      'MUN-DGP-007'),
    ('survey@wb.gov',             '$2b$12$LandStackAdminHashPlaceholderXXXXXXXXXXXX', 'Amit Dutta',           '9000000005', 'survey_officer',       'Survey Dept WB',   'SRV-DGP-023'),
    ('citizen@demo.com',          '$2b$12$LandStackAdminHashPlaceholderXXXXXXXXXXXX', 'Ravi Kumar Sharma',    '9876543210', 'citizen',              NULL,               NULL)
) AS u(email, phash, fname, phone, role, dept, empid)
ON CONFLICT (email) DO NOTHING;

-- Record seed migration
INSERT INTO schema_migrations (migration_id, description) VALUES
    ('003_synthetic_seeds', 'Synthetic data: 20 parcels, owners, registrations, tax, permits, alerts (West Bengal demo region)')
ON CONFLICT (migration_id) DO NOTHING;
