// Applications controller
// Citizen service application workflow

const pool = require('../db/pool');
const { writeAuditLog } = require('../middleware/audit');

/**
 * Generate human-readable application number
 * Format: LS-YYYY-NNNNNN
 */
async function generateApplicationNo() {
  const year = new Date().getFullYear();
  const { rows } = await pool.query('SELECT nextval(\'application_seq\') AS seq');
  const seq = String(rows[0].seq).padStart(6, '0');
  return `LS-${year}-${seq}`;
}

/**
 * POST /api/applications
 * Citizen submits a service application
 */
async function submitApplication(req, res) {
  const { parcel_id, service_type, description } = req.validatedBody;

  try {
    const application_no = await generateApplicationNo();

    const { rows } = await pool.query(`
      INSERT INTO applications 
        (application_no, parcel_id, applicant_id, service_type, description, status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, 'submitted', NOW())
      RETURNING *
    `, [application_no, parcel_id || null, req.user.userId, service_type, description]);

    const application = rows[0];

    // Record initial status history
    await pool.query(`
      INSERT INTO application_status_history (application_id, new_status, changed_by, remarks)
      VALUES ($1, 'submitted', $2, 'Application submitted by citizen')
    `, [application.application_id, req.user.userId]);

    await writeAuditLog({
      userId: req.user.userId,
      action: 'SUBMIT_APPLICATION',
      tableName: 'applications',
      recordId: application.application_id,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application_id: application.application_id,
        application_no: application.application_no,
        status: application.status,
        submitted_at: application.submitted_at
      }
    });
  } catch (err) {
    console.error('[APPLICATIONS] submitApplication error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit application.' });
  }
}

/**
 * GET /api/applications/my
 * Citizen views their own applications
 */
async function getMyApplications(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.*,
        p.ulpin,
        p.land_use,
        v.village_name,
        u.full_name AS assigned_to_name
      FROM applications a
      LEFT JOIN parcels p ON p.parcel_id = a.parcel_id
      LEFT JOIN villages v ON v.village_id = p.village_id
      LEFT JOIN users u ON u.user_id = a.assigned_to
      WHERE a.applicant_id = $1
      ORDER BY a.submitted_at DESC
    `, [req.user.userId]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[APPLICATIONS] getMyApplications error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
}

/**
 * GET /api/applications/:id
 * Get application with full status history
 */
async function getApplicationById(req, res) {
  const { id } = req.params;

  try {
    const appResult = await pool.query(`
      SELECT a.*, p.ulpin, v.village_name, u.full_name AS applicant_name
      FROM applications a
      LEFT JOIN parcels p ON p.parcel_id = a.parcel_id
      LEFT JOIN villages v ON v.village_id = p.village_id
      JOIN users u ON u.user_id = a.applicant_id
      WHERE a.application_id = $1 OR a.application_no = $1
    `, [id]);

    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    const application = appResult.rows[0];

    // Check authorization — citizens can only see their own
    if (req.user.roleName === 'citizen' && application.applicant_id !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    // Get status history
    const historyResult = await pool.query(`
      SELECT ash.*, u.full_name AS changed_by_name
      FROM application_status_history ash
      LEFT JOIN users u ON u.user_id = ash.changed_by
      WHERE ash.application_id = $1
      ORDER BY ash.created_at ASC
    `, [application.application_id]);

    return res.json({
      success: true,
      data: {
        ...application,
        status_history: historyResult.rows
      }
    });
  } catch (err) {
    console.error('[APPLICATIONS] getApplicationById error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch application.' });
  }
}

/**
 * GET /api/applications (officer view — all pending applications)
 */
async function getAllApplications(req, res) {
  const { status, limit = 50, offset = 0 } = req.query;

  try {
    const { rows } = await pool.query(`
      SELECT 
        a.*,
        p.ulpin,
        v.village_name,
        u.full_name AS applicant_name,
        u.phone AS applicant_phone
      FROM applications a
      JOIN users u ON u.user_id = a.applicant_id
      LEFT JOIN parcels p ON p.parcel_id = a.parcel_id
      LEFT JOIN villages v ON v.village_id = p.village_id
      WHERE ($1::text IS NULL OR a.status = $1)
      ORDER BY 
        CASE a.status WHEN 'submitted' THEN 1 WHEN 'under_review' THEN 2 ELSE 3 END,
        a.submitted_at DESC
      LIMIT $2 OFFSET $3
    `, [status || null, limit, offset]);

    return res.json({ success: true, data: rows, meta: { count: rows.length } });
  } catch (err) {
    console.error('[APPLICATIONS] getAllApplications error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
}

/**
 * PATCH /api/applications/:id/status
 * Officer updates application status
 */
async function updateApplicationStatus(req, res) {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const validStatuses = ['under_review', 'field_verification', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status.' });
  }

  try {
    const { rows } = await pool.query(`
      UPDATE applications
      SET status = $1, assigned_to = $2,
          resolved_at = CASE WHEN $1 IN ('approved', 'rejected') THEN NOW() ELSE resolved_at END
      WHERE application_id = $3
      RETURNING *
    `, [status, req.user.userId, id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    // Add to status history
    await pool.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, remarks)
      SELECT $1, status, $2, $3, $4
      FROM applications WHERE application_id = $1
    `, [id, status, req.user.userId, remarks || null]);

    await writeAuditLog({
      userId: req.user.userId,
      action: 'UPDATE_APPLICATION_STATUS',
      tableName: 'applications',
      recordId: id,
      newValue: status,
      changeReason: remarks,
      ipAddress: req.ip
    });

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[APPLICATIONS] updateApplicationStatus error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update application.' });
  }
}

module.exports = {
  submitApplication, getMyApplications, getApplicationById,
  getAllApplications, updateApplicationStatus
};
