// Dashboard controller
// Aggregated statistics for officer and admin dashboards

const pool = require('../db/pool');

/**
 * GET /api/dashboard/stats
 * Overall system statistics
 */
async function getDashboardStats(req, res) {
  try {
    const [
      parcelStats, alertStats, applicationStats, landUseStats
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) AS total_parcels,
          COUNT(*) FILTER (WHERE has_overlap) AS overlapping_parcels,
          COUNT(*) FILTER (WHERE area_mismatch_pct > 5) AS area_mismatch_parcels,
          COUNT(DISTINCT district_id) AS districts_covered,
          COUNT(DISTINCT village_id) AS villages_covered
        FROM parcels WHERE is_active = TRUE
      `),
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM ai_alerts WHERE status = 'pending') AS ai_pending,
          (SELECT COUNT(*) FROM ai_alerts WHERE status = 'verified') AS ai_verified,
          (SELECT COUNT(*) FROM ai_alerts WHERE status = 'dismissed') AS ai_dismissed,
          (SELECT COUNT(*) FROM data_quality_alerts WHERE status = 'open') AS quality_open,
          (SELECT COUNT(*) FROM data_quality_alerts WHERE severity = 'critical' AND status = 'open') AS quality_critical
      `),
      pool.query(`
        SELECT 
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'submitted') AS submitted,
          COUNT(*) FILTER (WHERE status = 'under_review') AS under_review,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved,
          COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
        FROM applications
      `),
      pool.query(`
        SELECT land_use, COUNT(*) as count
        FROM parcels WHERE is_active = TRUE
        GROUP BY land_use
        ORDER BY count DESC
      `)
    ]);

    return res.json({
      success: true,
      data: {
        parcels: parcelStats.rows[0],
        alerts: alertStats.rows[0],
        applications: applicationStats.rows[0],
        land_use_distribution: landUseStats.rows,
        generated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[DASHBOARD] getDashboardStats error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats.' });
  }
}

/**
 * GET /api/dashboard/recent-activity
 * Recent audit log entries for dashboard
 */
async function getRecentActivity(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT 
        al.action, al.table_name, al.created_at,
        u.full_name, u.role_id,
        r.role_name
      FROM audit_logs al
      LEFT JOIN users u ON u.user_id = al.user_id
      LEFT JOIN roles r ON r.role_id = u.role_id
      ORDER BY al.created_at DESC
      LIMIT 20
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[DASHBOARD] getRecentActivity error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch activity.' });
  }
}

module.exports = { getDashboardStats, getRecentActivity };
