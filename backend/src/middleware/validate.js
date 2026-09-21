// Request validation middleware using Zod
// Validates request body/query/params against a Zod schema

const { z } = require('zod');

/**
 * Factory: create middleware that validates req.body against a Zod schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten()
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

/**
 * Factory: create middleware that validates req.query against a Zod schema
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: result.error.flatten()
      });
    }
    req.validatedQuery = result.data;
    next();
  };
}

// Common schemas
const schemas = {
  login: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    loginAadhaar: z.string().optional(),
    aadhaar: z.string().optional(),
    otp: z.string().optional()
  }),

  register: z.object({
    name: z.string().min(3).max(100).optional(),
    fullName: z.string().min(3).max(100).optional(),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    aadhaar: z.string().optional(),
    state: z.string().optional(),
    stateSlug: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional()
  }),

  parcelSearch: z.object({
    q: z.string().min(1).max(100),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0)
  }),

  applicationSubmit: z.object({
    parcel_id: z.string().uuid().optional(),
    service_type: z.enum(['mutation', 'ror_copy', 'encumbrance_cert', 'name_correction', 'grievance', 'other']),
    description: z.string().min(10).max(2000)
  }),

  alertVerify: z.object({
    action: z.enum(['verified', 'dismissed', 'escalated']),
    remarks: z.string().max(1000).optional()
  })
};

module.exports = { validateBody, validateQuery, schemas };
