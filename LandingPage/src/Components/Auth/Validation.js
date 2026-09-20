// components/Auth/Validation.js
// ─────────────────────────────────────────────────────────────────────────────
// All validation helpers and input sanitisers for the Auth forms.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Input Sanitisers ─────────────────────────────────────────────────────────
// Call these inside onChange BEFORE updating state to strip illegal characters.

/**
 * Phone: digits only, max 11 characters.
 */
export function sanitizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

/**
 * Aadhaar: digits only, max 12 digits, auto-formatted as XXXX XXXX XXXX.
 * Returns the display string (with spaces); store raw digits separately if needed.
 */
export function sanitizeAadhaar(value) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  // Insert a space after every 4th digit
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * PIN code: digits only, max 6 characters.
 */
export function sanitizePincode(value) {
  return value.replace(/\D/g, "").slice(0, 6);
}

// ─── Field Validators ─────────────────────────────────────────────────────────
// Each returns an error string, or "" if valid.

/**
 * Name: 3–99 chars, letters only (spaces allowed between words).
 * No leading/trailing spaces, no digits, no symbols.
 */
export function validateName(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < 3) return "Name must be at least 3 characters.";
  if (trimmed.length > 99) return "Name cannot exceed 99 characters.";
  if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(trimmed))
    return "Name can only contain letters and spaces between words.";
  return "";
}

/**
 * Phone: 10–11 digits, must start with 6, 7, 8, or 9.
 */
export function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Phone number is required.";
  if (!/^[6-9]\d{9,10}$/.test(digits))
    return "Enter a valid 10–11 digit number starting with 6, 7, 8, or 9.";
  return "";
}

/**
 * Email: standard email format (user@domain.tld).
 */
export function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return "Enter a valid email address.";
  return "";
}

/**
 * Aadhaar: exactly 12 digits (strip spaces before checking).
 */
export function validateAadhaar(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Aadhaar number is required.";
  if (digits.length !== 12) return "Aadhaar must be exactly 12 digits.";
  return "";
}

/**
 * PIN code: exactly 6 digits, must not start with 0.
 */
export function validatePincode(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Pincode is required.";
  if (digits.length !== 6) return "Pincode must be exactly 6 digits.";
  if (digits[0] === "0") return "Pincode cannot start with 0.";
  return "";
}

/**
 * Password: minimum 8 characters (enforced, not just hinted).
 */
export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return "";
}

// ─── Central dispatcher (used by debounce handler) ───────────────────────────
// Maps a field name to its validator. Used for live / debounced validation.

export function validateField(name, value) {
  switch (name) {
    case "name":        return validateName(value);
    case "phone":       return validatePhone(value);
    case "email":       return validateEmail(value);
    case "aadhaar":     return validateAadhaar(value);
    case "loginAadhaar":return validateAadhaar(value); // login reuses same rule
    case "pincode":     return validatePincode(value);
    case "password":    return validatePassword(value);
    default:            return "";
  }
}

// ─── Sign-Up submit validator ─────────────────────────────────────────────────
// Validates every field in the registration form.
// Returns an errors object — all values are "" when the form is valid.

export function validateSignupFields(formData) {
  return {
    name:     validateName(formData.name),
    phone:    validatePhone(formData.phone),
    email:    validateEmail(formData.email),
    aadhaar:  validateAadhaar(formData.aadhaar),
    pincode:  validatePincode(formData.pincode),
    password: validatePassword(formData.password),
    // login-only fields are always clean in signup context
    loginAadhaar: "",
  };
}

// ─── Login submit validator ───────────────────────────────────────────────────
// Validates only the fields shown on the login form:
//   Gmail ID (email), Aadhaar number, Password.

export function validateLoginFields(formData) {
  return {
    // signup-only fields are always clean in login context
    name: "", phone: "", aadhaar: "", pincode: "",
    email:        validateEmail(formData.email),
    loginAadhaar: validateAadhaar(formData.loginAadhaar),
    password:     validatePassword(formData.password),
  };
}
