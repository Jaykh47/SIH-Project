// Mock Department APIs
// Simulates responses from real government department systems
// In production, these would connect to actual departmental APIs
// ⚠️ PROTOTYPE / SYNTHETIC DATA — not real government records

const pool = require('../db/pool');

/**
 * GET /mock/revenue/:ulpin
 * Simulates Revenue Department API response (RoR / Khatian data)
 */
async function getRevenueData(req, res) {
  const { ulpin } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT 
        p.ulpin, p.khasra_no, p.area_recorded,
        p.land_use, p.land_type,
        v.village_name AS mouza_name, v.lgd_code,
        b.block_name,
        d.district_name, d.district_code,
        s.state_name, s.state_code,
        json_agg(json_build_object(
          'khatian_no', rr.source_record_id,
          'owner_name', o.full_name,
          'father_name', o.father_name,
          'share', rr.ownership_share,
          'type', rr.ownership_type,
          'since', rr.effective_from
        )) AS owners,
        json_agg(json_build_object(
          'mutation_no', m.mutation_no,
          'type', m.mutation_type,
          'date', m.mutation_date,
          'status', m.status
        )) AS mutations
      FROM parcels p
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN blocks b ON b.block_id = v.block_id
      LEFT JOIN districts d ON d.district_id = p.district_id
      LEFT JOIN states s ON s.state_id = p.state_id
      LEFT JOIN rights_records rr ON rr.parcel_id = p.parcel_id AND rr.is_current = TRUE
      LEFT JOIN owners o ON o.owner_id = rr.owner_id
      LEFT JOIN mutations m ON m.parcel_id = p.parcel_id
      WHERE p.ulpin = $1
      GROUP BY p.parcel_id, v.village_name, v.lgd_code, b.block_name,
               d.district_name, d.district_code, s.state_name, s.state_code
    `, [ulpin.toUpperCase()]);

    if (rows.length === 0) {
      return res.status(404).json({
        source: 'Revenue Department WB (SYNTHETIC)',
        error: `No revenue record found for ULPIN: ${ulpin}`
      });
    }

    return res.json({
      source: 'Revenue Department, West Bengal',
      system: 'Bhumi - WB Land Records',
      data_type: 'SYNTHETIC_PROTOTYPE',
      fetched_at: new Date().toISOString(),
      record: rows[0]
    });
  } catch (err) {
    console.error('[MOCK/REVENUE] Error:', err);
    return res.status(500).json({ error: 'Revenue service error.' });
  }
}

/**
 * GET /mock/registration/:ulpin
 * Simulates Registration Department (IGRS) API response
 */
async function getRegistrationData(req, res) {
  const { ulpin } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT r.*
      FROM registrations r
      JOIN parcels p ON p.parcel_id = r.parcel_id
      WHERE p.ulpin = $1
      ORDER BY r.registration_date DESC
    `, [ulpin.toUpperCase()]);

    return res.json({
      source: 'Registration Department, West Bengal',
      system: 'IGRS - WB Property Registration',
      data_type: 'SYNTHETIC_PROTOTYPE',
      fetched_at: new Date().toISOString(),
      records: rows,
      count: rows.length
    });
  } catch (err) {
    console.error('[MOCK/REGISTRATION] Error:', err);
    return res.status(500).json({ error: 'Registration service error.' });
  }
}

/**
 * GET /mock/tax/:ulpin
 * Simulates Municipality / Property Tax API response
 */
async function getTaxData(req, res) {
  const { ulpin } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT t.*
      FROM tax_records t
      JOIN parcels p ON p.parcel_id = t.parcel_id
      WHERE p.ulpin = $1
      ORDER BY t.assessment_year DESC
    `, [ulpin.toUpperCase()]);

    return res.json({
      source: 'Durgapur Municipal Corporation',
      system: 'Municipal Property Tax System',
      data_type: 'SYNTHETIC_PROTOTYPE',
      fetched_at: new Date().toISOString(),
      records: rows,
      current_year: rows[0] || null
    });
  } catch (err) {
    console.error('[MOCK/TAX] Error:', err);
    return res.status(500).json({ error: 'Tax service error.' });
  }
}

/**
 * GET /mock/municipality/:ulpin
 * Simulates Municipality building permissions API
 */
async function getMunicipalityData(req, res) {
  const { ulpin } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT bp.*
      FROM building_permissions bp
      JOIN parcels p ON p.parcel_id = bp.parcel_id
      WHERE p.ulpin = $1
      ORDER BY bp.approval_date DESC
    `, [ulpin.toUpperCase()]);

    return res.json({
      source: 'Durgapur Municipal Corporation - Building Dept',
      system: 'Building Permission Management System',
      data_type: 'SYNTHETIC_PROTOTYPE',
      fetched_at: new Date().toISOString(),
      permits: rows,
      has_valid_permit: rows.some(p => p.status === 'approved')
    });
  } catch (err) {
    console.error('[MOCK/MUNICIPALITY] Error:', err);
    return res.status(500).json({ error: 'Municipality service error.' });
  }
}

/**
 * GET /mock/planning/:ulpin
 * Simulates Town Planning / Zoning API
 */
async function getPlanningData(req, res) {
  const { ulpin } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT zr.*, p.land_use AS current_land_use
      FROM zoning_records zr
      JOIN parcels p ON p.parcel_id = zr.parcel_id
      WHERE p.ulpin = $1
      ORDER BY zr.effective_from DESC
    `, [ulpin.toUpperCase()]);

    return res.json({
      source: 'Town Planning Department, Durgapur',
      system: 'Development Plan Management System',
      data_type: 'SYNTHETIC_PROTOTYPE',
      fetched_at: new Date().toISOString(),
      zoning: rows[0] || null,
      history: rows
    });
  } catch (err) {
    console.error('[MOCK/PLANNING] Error:', err);
    return res.status(500).json({ error: 'Planning service error.' });
  }
}

module.exports = {
  getRevenueData, getRegistrationData, getTaxData,
  getMunicipalityData, getPlanningData
};
