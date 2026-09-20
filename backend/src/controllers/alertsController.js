// Alerts controller
// Handles both AI alerts and data quality alerts
// Officers verify alerts — AI never auto-modifies records

const pool = require('../db/pool');
const { writeAuditLog } = require('../middleware/audit');

/**
 * GET /api/alerts/ai
 * List AI alerts (for officer dashboard)
 */
async function getAiAlerts(req, res) {
  const { status = 'pending', limit = 50, offset = 0 } = req.query;

  try {
    const { rows } = await pool.query(`
      SELECT 
        aa.*,
        p.ulpin, p.land_use,
        v.village_name,
        ST_AsGeoJSON(aa.change_geometry)::json AS change_geometry,
        u.full_name AS verified_by_name
      FROM ai_alerts aa
      JOIN parcels p ON p.parcel_id = aa.parcel_id
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN users u ON u.user_id = aa.verified_by
      WHERE ($1 = 'all' OR aa.status = $1)
      ORDER BY 
        CASE aa.status WHEN 'pending' THEN 1 ELSE 2 END,
        aa.confidence DESC,
        aa.detected_at DESC
      LIMIT $2 OFFSET $3
    `, [status, limit, offset]);

    return res.json({
      success: true,
      data: rows,
      meta: { status, count: rows.length }
    });
  } catch (err) {
    console.error('[ALERTS] getAiAlerts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch AI alerts.' });
  }
}

/**
 * GET /api/alerts/quality
 * List data quality alerts
 */
async function getQualityAlerts(req, res) {
  const { status = 'open', limit = 50, offset = 0 } = req.query;

  try {
    const { rows } = await pool.query(`
      SELECT 
        dqa.*,
        p.ulpin, p.land_use,
        v.village_name,
        u.full_name AS resolved_by_name
      FROM data_quality_alerts dqa
      JOIN parcels p ON p.parcel_id = dqa.parcel_id
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN users u ON u.user_id = dqa.resolved_by
      WHERE ($1 = 'all' OR dqa.status = $1)
      ORDER BY 
        CASE dqa.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        dqa.detected_at DESC
      LIMIT $2 OFFSET $3
    `, [status, limit, offset]);

    return res.json({
      success: true,
      data: rows,
      meta: { status, count: rows.length }
    });
  } catch (err) {
    console.error('[ALERTS] getQualityAlerts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch quality alerts.' });
  }
}

/**
 * PATCH /api/alerts/ai/:alertId/verify
 * Officer verifies or dismisses an AI alert
 * This is the human-in-the-loop decision point
 * AI NEVER auto-modifies records — officers make all decisions
 */
async function verifyAiAlert(req, res) {
  const { alertId } = req.params;
  const { action, remarks } = req.validatedBody; // action: 'verified' | 'dismissed' | 'escalated'

  try {
    const { rows } = await pool.query(`
      UPDATE ai_alerts 
      SET 
        status = $1,
        verified_at = NOW(),
        verified_by = $2,
        officer_remarks = $3
      WHERE alert_id = $4
      RETURNING *, (SELECT ulpin FROM parcels WHERE parcel_id = ai_alerts.parcel_id) AS ulpin
    `, [action, req.user.userId, remarks || null, alertId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found.' });
    }

    // Write audit log
    await writeAuditLog({
      userId: req.user.userId,
      action: `VERIFY_AI_ALERT_${action.toUpperCase()}`,
      tableName: 'ai_alerts',
      recordId: alertId,
      newValue: action,
      changeReason: remarks,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Alert ${action} by ${req.user.fullName}`,
      data: rows[0]
    });
  } catch (err) {
    console.error('[ALERTS] verifyAiAlert error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify alert.' });
  }
}

/**
 * PATCH /api/alerts/quality/:alertId/resolve
 * Officer resolves a data quality alert
 */
async function resolveQualityAlert(req, res) {
  const { alertId } = req.params;
  const { action, remarks } = req.validatedBody;

  try {
    const { rows } = await pool.query(`
      UPDATE data_quality_alerts
      SET 
        status = $1,
        resolved_at = NOW(),
        resolved_by = $2
      WHERE alert_id = $3
      RETURNING *
    `, [action, req.user.userId, alertId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found.' });
    }

    await writeAuditLog({
      userId: req.user.userId,
      action: `RESOLVE_QUALITY_ALERT_${action.toUpperCase()}`,
      tableName: 'data_quality_alerts',
      recordId: alertId,
      changeReason: remarks,
      ipAddress: req.ip
    });

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[ALERTS] resolveQualityAlert error:', err);
    return res.status(500).json({ success: false, error: 'Failed to resolve alert.' });
  }
}

/**
 * GET /api/alerts/summary
 * Dashboard summary of all alerts
 */
async function getAlertSummary(req, res) {
  try {
    const [aiResult, qualityResult] = await Promise.all([
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM ai_alerts
        GROUP BY status
      `),
      pool.query(`
        SELECT severity, status, COUNT(*) as count
        FROM data_quality_alerts
        GROUP BY severity, status
      `)
    ]);

    const aiSummary = {};
    aiResult.rows.forEach(r => { aiSummary[r.status] = parseInt(r.count); });

    const qualitySummary = {};
    qualityResult.rows.forEach(r => {
      const key = `${r.severity}_${r.status}`;
      qualitySummary[key] = parseInt(r.count);
    });

    return res.json({
      success: true,
      data: {
        ai_alerts: aiSummary,
        quality_alerts: qualitySummary,
        total_pending: (aiSummary.pending || 0) + 
          qualityResult.rows.filter(r => r.status === 'open').reduce((s, r) => s + parseInt(r.count), 0)
      }
    });
  } catch (err) {
    console.error('[ALERTS] getAlertSummary error:', err);
    return res.status(500).json({ success: false, error: 'Failed to get alert summary.' });
  }
}

module.exports = { getAiAlerts, getQualityAlerts, verifyAiAlert, resolveQualityAlert, getAlertSummary };
