// Role-Based Access Control (RBAC) middleware
// All permission checks happen server-side — never rely only on frontend hiding

// Define which roles can perform which actions
const ROLE_PERMISSIONS = {
  admin: [
    'view:parcels', 'view:sensitive', 'edit:parcels', 'edit:records',
    'verify:alerts', 'process:applications', 'manage:users',
    'view:dashboard', 'view:audit'
  ],
  revenue_officer: [
    'view:parcels', 'view:sensitive', 'edit:records',
    'verify:alerts', 'process:applications', 'view:dashboard'
  ],
  registration_officer: [
    'view:parcels', 'view:sensitive', 'process:applications', 'view:dashboard'
  ],
  municipality_officer: [
    'view:parcels', 'view:sensitive', 'verify:alerts',
    'process:applications', 'view:dashboard'
  ],
  survey_officer: [
    'view:parcels', 'view:sensitive', 'edit:parcels', 'verify:alerts', 'view:dashboard'
  ],
  citizen: [
    'view:parcels', 'submit:applications', 'view:own_applications', 'view:dashboard'
  ]
};

/**
 * Factory: create middleware that requires a specific permission
 * Usage: router.get('/sensitive', requireAuth, requirePermission('view:sensitive'), handler)
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const roleName = req.user.roleName;
    const permissions = ROLE_PERMISSIONS[roleName] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Your role (${roleName}) does not have permission: ${permission}`
      });
    }

    next();
  };
}

/**
 * Factory: require one of multiple roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.roleName)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = { requirePermission, requireRole, ROLE_PERMISSIONS };
