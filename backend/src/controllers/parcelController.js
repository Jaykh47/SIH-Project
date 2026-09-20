// Parcel controller
// Core GIS parcel queries using PostGIS
// Returns GeoJSON for map display, JSON for detail views

const pool = require('../db/pool');

/**
 * GET /api/parcels
 * Return all parcels as GeoJSON FeatureCollection for map display
 * Uses simplified geometry for performance
 */
async function getAllParcels(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.parcel_id,
        p.ulpin,
        p.khasra_no,
        p.plot_no,
        p.land_use,
        p.land_type,
        p.area_recorded,
        p.area_mismatch_pct,
        p.has_overlap,
        v.village_name,
        d.district_name,
        -- GeoJSON geometry for Leaflet
        ST_AsGeoJSON(p.geometry)::json AS geometry,
        -- Count alerts for each parcel
        (SELECT COUNT(*) FROM data_quality_alerts dqa WHERE dqa.parcel_id = p.parcel_id AND dqa.status = 'open') as quality_alert_count,
        (SELECT COUNT(*) FROM ai_alerts aa WHERE aa.parcel_id = p.parcel_id AND aa.status = 'pending') as ai_alert_count
      FROM parcels p
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN districts d ON d.district_id = p.district_id
      WHERE p.is_active = TRUE
      ORDER BY p.ulpin
    `);

    // Format as GeoJSON FeatureCollection (standard format for Leaflet)
    const featureCollection = {
      type: 'FeatureCollection',
      features: rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          parcel_id:          row.parcel_id,
          ulpin:              row.ulpin,
          khasra_no:          row.khasra_no,
          plot_no:            row.plot_no,
          land_use:           row.land_use,
          land_type:          row.land_type,
          area_recorded:      row.area_recorded,
          area_mismatch_pct:  row.area_mismatch_pct,
          has_overlap:        row.has_overlap,
          village_name:       row.village_name,
          district_name:      row.district_name,
          quality_alert_count: parseInt(row.quality_alert_count),
          ai_alert_count:      parseInt(row.ai_alert_count),
          // For map coloring
          has_alerts:         parseInt(row.quality_alert_count) > 0 || parseInt(row.ai_alert_count) > 0
        }
      }))
    };

    return res.json({ success: true, data: featureCollection });
  } catch (err) {
    console.error('[PARCELS] getAllParcels error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch parcels.' });
  }
}

/**
 * GET /api/parcels/search?q=<query>
 * Search parcels by ULPIN, khasra number, plot number, or owner name
 */
async function searchParcels(req, res) {
  const { q, limit = 20, offset = 0 } = req.query;
  const searchTerm = `%${q}%`;

  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (p.parcel_id)
        p.parcel_id,
        p.ulpin,
        p.khasra_no,
        p.plot_no,
        p.land_use,
        p.area_recorded,
        v.village_name,
        d.district_name,
        ST_AsGeoJSON(ST_Centroid(p.geometry))::json AS centroid
      FROM parcels p
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN districts d ON d.district_id = p.district_id
      LEFT JOIN rights_records rr ON rr.parcel_id = p.parcel_id AND rr.is_current = TRUE
      LEFT JOIN owners o ON o.owner_id = rr.owner_id
      WHERE p.is_active = TRUE
        AND (
          p.ulpin ILIKE $1
          OR p.khasra_no ILIKE $1
          OR p.plot_no ILIKE $1
          OR p.survey_no ILIKE $1
          OR o.full_name ILIKE $1
        )
      ORDER BY p.parcel_id, p.ulpin
      LIMIT $2 OFFSET $3
    `, [searchTerm, limit, offset]);

    return res.json({
      success: true,
      data: rows,
      meta: { query: q, count: rows.length, limit, offset }
    });
  } catch (err) {
    console.error('[PARCELS] searchParcels error:', err);
    return res.status(500).json({ success: false, error: 'Search failed.' });
  }
}

/**
 * GET /api/parcels/:ulpin
 * Get basic parcel info by ULPIN
 */
async function getParcelByUlpin(req, res) {
  const { ulpin } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        v.village_name,
        v.mouza_name,
        b.block_name,
        d.district_name,
        s.state_name,
        ST_AsGeoJSON(p.geometry)::json AS geometry_geojson,
        ROUND(ST_Area(ST_Transform(p.geometry, 32644))::numeric, 2) AS area_gis_computed
      FROM parcels p
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN blocks b ON b.block_id = v.block_id
      LEFT JOIN districts d ON d.district_id = p.district_id
      LEFT JOIN states s ON s.state_id = p.state_id
      WHERE p.ulpin = $1 AND p.is_active = TRUE
    `, [ulpin.toUpperCase()]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: `Parcel ${ulpin} not found.` });
    }

    const parcel = rows[0];
    // Replace geometry column with GeoJSON version
    parcel.geometry = parcel.geometry_geojson;
    delete parcel.geometry_geojson;

    return res.json({ success: true, data: parcel });
  } catch (err) {
    console.error('[PARCELS] getParcelByUlpin error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch parcel.' });
  }
}

/**
 * GET /api/parcels/:ulpin/unified
 * THE CORE LANDSTACK ENDPOINT
 * Returns a unified view of all departmental data for a parcel
 */
async function getUnifiedParcelView(req, res) {
  const { ulpin } = req.params;

  try {
    // 1. Core parcel data
    const parcelResult = await pool.query(`
      SELECT 
        p.*,
        v.village_name, v.mouza_name,
        b.block_name,
        d.district_name, d.district_code,
        s.state_name, s.state_code,
        ST_AsGeoJSON(p.geometry)::json AS geometry,
        ROUND(ST_Area(ST_Transform(p.geometry, 32644))::numeric, 2) AS area_gis_computed
      FROM parcels p
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN blocks b ON b.block_id = v.block_id
      LEFT JOIN districts d ON d.district_id = p.district_id
      LEFT JOIN states s ON s.state_id = p.state_id
      WHERE p.ulpin = $1 AND p.is_active = TRUE
    `, [ulpin.toUpperCase()]);

    if (parcelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Parcel ${ulpin} not found.` });
    }

    const parcel = parcelResult.rows[0];

    // Run all departmental queries in parallel for performance
    const [
      ownersResult, registrationsResult, taxResult,
      permissionsResult, zoningResult, disputesResult,
      qualityAlertsResult, aiAlertsResult
    ] = await Promise.all([
      // 2. Ownership (Revenue Dept)
      pool.query(`
        SELECT rr.*, o.full_name, o.father_name, o.address,
               rr.source_system, rr.source_record_id
        FROM rights_records rr
        JOIN owners o ON o.owner_id = rr.owner_id
        WHERE rr.parcel_id = $1 AND rr.is_current = TRUE
        ORDER BY rr.ownership_share DESC
      `, [parcel.parcel_id]),

      // 3. Registration history
      pool.query(`
        SELECT * FROM registrations
        WHERE parcel_id = $1
        ORDER BY registration_date DESC
        LIMIT 10
      `, [parcel.parcel_id]),

      // 4. Tax records
      pool.query(`
        SELECT * FROM tax_records
        WHERE parcel_id = $1
        ORDER BY assessment_year DESC
        LIMIT 5
      `, [parcel.parcel_id]),

      // 5. Building permissions
      pool.query(`
        SELECT * FROM building_permissions
        WHERE parcel_id = $1
        ORDER BY approval_date DESC
      `, [parcel.parcel_id]),

      // 6. Zoning
      pool.query(`
        SELECT * FROM zoning_records
        WHERE parcel_id = $1
        ORDER BY effective_from DESC
        LIMIT 1
      `, [parcel.parcel_id]),

      // 7. Disputes
      pool.query(`
        SELECT * FROM disputes
        WHERE parcel_id = $1
        ORDER BY filed_date DESC
      `, [parcel.parcel_id]),

      // 8. Data quality alerts
      pool.query(`
        SELECT * FROM data_quality_alerts
        WHERE parcel_id = $1
        ORDER BY 
          CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
          detected_at DESC
      `, [parcel.parcel_id]),

      // 9. AI alerts
      pool.query(`
        SELECT alert_id, alert_type, confidence, description, evidence_data,
               affected_area, status, detected_at, verified_at, officer_remarks,
               ST_AsGeoJSON(change_geometry)::json AS change_geometry
        FROM ai_alerts
        WHERE parcel_id = $1
        ORDER BY detected_at DESC
      `, [parcel.parcel_id])
    ]);

    // Assemble unified view
    const unifiedView = {
      // Metadata
      _landstack: {
        version: '1.0',
        generated_at: new Date().toISOString(),
        data_type: 'SYNTHETIC_PROTOTYPE',
        disclaimer: 'All data is synthetic for demonstration purposes only'
      },

      // Core parcel
      parcel: {
        ...parcel,
        geometry: parcel.geometry,
        area_gis_computed: parcel.area_gis_computed
      },

      // Revenue department data
      revenue: {
        source: 'Revenue Department, West Bengal (SYNTHETIC)',
        owners: ownersResult.rows,
        has_owners: ownersResult.rows.length > 0
      },

      // Registration department data
      registration: {
        source: 'Registration Department, West Bengal (SYNTHETIC)',
        records: registrationsResult.rows,
        latest: registrationsResult.rows[0] || null
      },

      // Municipality / Tax
      tax: {
        source: 'Durgapur Municipal Corporation (SYNTHETIC)',
        records: taxResult.rows,
        current: taxResult.rows[0] || null,
        total_arrears: taxResult.rows.reduce((sum, r) => sum + (parseFloat(r.arrears_amt) || 0), 0)
      },

      // Building permissions
      permits: {
        source: 'Building Permit Authority, Durgapur MC (SYNTHETIC)',
        records: permissionsResult.rows,
        has_valid_permit: permissionsResult.rows.some(p => p.status === 'approved')
      },

      // Planning / Zoning
      planning: {
        source: 'Town Planning Dept, Durgapur (SYNTHETIC)',
        zoning: zoningResult.rows[0] || null
      },

      // Legal / Disputes
      legal: {
        disputes: disputesResult.rows,
        has_active_dispute: disputesResult.rows.some(d => d.status === 'active'),
        dispute_count: disputesResult.rows.length
      },

      // Intelligence (Data Quality)
      data_quality: {
        alerts: qualityAlertsResult.rows,
        open_count: qualityAlertsResult.rows.filter(a => a.status === 'open').length,
        has_critical: qualityAlertsResult.rows.some(a => a.severity === 'critical'),
        area_mismatch_pct: parcel.area_mismatch_pct,
        has_overlap: parcel.has_overlap
      },

      // Intelligence (AI)
      ai_intelligence: {
        alerts: aiAlertsResult.rows,
        pending_count: aiAlertsResult.rows.filter(a => a.status === 'pending').length
      }
    };

    return res.json({ success: true, data: unifiedView });

  } catch (err) {
    console.error('[PARCELS] getUnifiedParcelView error:', err);
    return res.status(500).json({ success: false, error: 'Failed to build unified parcel view.' });
  }
}

/**
 * GET /api/parcels/:ulpin/nearby?radius=500
 * Find nearby parcels within a given radius (in meters)
 * Uses PostGIS ST_DWithin
 */
async function getNearbyParcels(req, res) {
  const { ulpin } = req.params;
  const radius = Math.min(parseFloat(req.query.radius) || 500, 5000); // max 5km

  try {
    // First get the parcel's geometry
    const parcelResult = await pool.query(
      'SELECT geometry FROM parcels WHERE ulpin = $1', [ulpin.toUpperCase()]
    );
    if (parcelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parcel not found.' });
    }

    const { rows } = await pool.query(`
      SELECT 
        p.ulpin, p.land_use, p.area_recorded,
        v.village_name,
        ROUND(
          ST_Distance(
            ST_Transform(p.geometry, 32644),
            ST_Transform(
              (SELECT geometry FROM parcels WHERE ulpin = $1), 32644
            )
          )::numeric, 1
        ) AS distance_m,
        ST_AsGeoJSON(p.geometry)::json AS geometry
      FROM parcels p
      LEFT JOIN villages v ON v.village_id = p.village_id
      WHERE p.ulpin != $1
        AND ST_DWithin(
          ST_Transform(p.geometry, 32644),
          ST_Transform((SELECT geometry FROM parcels WHERE ulpin = $1), 32644),
          $2
        )
        AND p.is_active = TRUE
      ORDER BY distance_m
      LIMIT 10
    `, [ulpin.toUpperCase(), radius]);

    return res.json({
      success: true,
      data: {
        source_ulpin: ulpin,
        radius_m: radius,
        nearby: rows
      }
    });
  } catch (err) {
    console.error('[PARCELS] getNearbyParcels error:', err);
    return res.status(500).json({ success: false, error: 'Failed to find nearby parcels.' });
  }
}

module.exports = {
  getAllParcels, searchParcels, getParcelByUlpin,
  getUnifiedParcelView, getNearbyParcels
};
