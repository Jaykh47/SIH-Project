// frontend/src/components/Auth/Validation.js
// Validation helpers and input sanitisers for Auth forms.

/**
 * Phone: digits only, max 11 characters.
 */
export function sanitizePhone(value) {
  return (value || "").replace(/\D/g, "").slice(0, 11);
}

/**
 * Aadhaar: digits only, max 12 digits, auto-formatted as XXXX XXXX XXXX.
 */
export function sanitizeAadhaar(value) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * PIN code: digits only, max 6 characters.
 */
export function sanitizePincode(value) {
  return (value || "").replace(/\D/g, "").slice(0, 6);
}

/**
 * Name: 3–99 chars, letters only (spaces allowed between words).
 */
export function validateName(value) {
  const trimmed = (value || "").trim();
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
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "Phone number is required.";
  if (!/^[6-9]\d{9,10}$/.test(digits))
    return "Enter a valid 10–11 digit number starting with 6, 7, 8, or 9.";
  return "";
}

/**
 * Email: standard email format.
 */
export function validateEmail(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return "Enter a valid email address.";
  return "";
}

/**
 * Aadhaar: exactly 12 digits.
 */
export function validateAadhaar(value) {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "Aadhaar number is required.";
  if (digits.length !== 12) return "Aadhaar must be exactly 12 digits.";
  return "";
}

/**
 * PIN code: exactly 6 digits, must not start with 0.
 */
export function validatePincode(value) {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "Pincode is required.";
  if (digits.length !== 6) return "Pincode must be exactly 6 digits.";
  if (digits[0] === "0") return "Pincode cannot start with 0.";
  return "";
}

/**
 * Password: minimum 8 characters.
 */
export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return "";
}

/**
 * Central dispatcher for live/debounced validation.
 */
export function validateField(name, value) {
  switch (name) {
    case "name":
    case "fullName":     return validateName(value);
    case "phone":        return validatePhone(value);
    case "email":        return validateEmail(value);
    case "aadhaar":
    case "loginAadhaar": return validateAadhaar(value);
    case "pincode":      return validatePincode(value);
    case "password":     return validatePassword(value);
    default:             return "";
  }
}

/**
 * Validates all fields in the registration form.
 */
export function validateSignupFields(formData) {
  return {
    name:     validateName(formData.name || formData.fullName),
    phone:    validatePhone(formData.phone),
    email:    validateEmail(formData.email),
    aadhaar:  validateAadhaar(formData.aadhaar),
    pincode:  validatePincode(formData.pincode),
    password: validatePassword(formData.password),
    loginAadhaar: "",
  };
}

/**
 * Validates fields shown on the login form.
 */
export function validateLoginFields(formData) {
  return {
    name: "", phone: "", aadhaar: "", pincode: "",
    email:        validateEmail(formData.email),
    loginAadhaar: validateAadhaar(formData.loginAadhaar),
    password:     validatePassword(formData.password),
  };
}
