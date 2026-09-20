// Audit logging middleware and service
// Records WHO did WHAT to WHICH record, WHEN, and WHY
// This is critical for government systems — every significant action must be traceable

const pool = require('../db/pool');

/**
 * Write an audit log entry
 * @param {Object} params
 * @param {string} params.userId - UUID of the user performing action
 * @param {string} params.action - e.g., 'CREATE', 'UPDATE', 'VIEW_SENSITIVE', 'VERIFY_ALERT'
 * @param {string} params.tableName - database table affected
 * @param {string} params.recordId - UUID of the affected record
 * @param {string} [params.fieldName] - specific field changed
 * @param {string} [params.oldValue] - previous value
 * @param {string} [params.newValue] - new value
 * @param {string} [params.changeReason] - reason for change
 * @param {string} [params.ipAddress] - client IP
 */
async function writeAuditLog({
  userId, action, tableName, recordId,
  fieldName, oldValue, newValue, changeReason, ipAddress
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs 
        (user_id, action, table_name, record_id, field_name, old_value, new_value, change_reason, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::inet)`,
      [userId, action, tableName, recordId, fieldName, oldValue, newValue, changeReason, ipAddress || null]
    );
  } catch (err) {
    // Audit logging should never break the main request
    console.error('[AUDIT] Failed to write log:', err.message);
  }
}

/**
 * Express middleware: automatically log all mutating requests
 * Attach to routes that modify data
 */
function auditMiddleware(action, tableName) {
  return (req, res, next) => {
    // Store original json function to intercept response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only log on successful responses
      if (res.statusCode < 400 && req.user) {
        const recordId = req.params?.id || body?.data?.id;
        writeAuditLog({
          userId: req.user.userId,
          action,
          tableName,
          recordId,
          ipAddress: req.ip
        }).catch(console.error);
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { writeAuditLog, auditMiddleware };
