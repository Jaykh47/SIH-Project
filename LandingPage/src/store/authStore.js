// src/store/authStore.js
// ─────────────────────────────────────────────────────────────────────────────
// In-memory singleton that holds auth state and signup/login location data.
// Resets on page refresh (intentional — no persistence needed at this stage).
// Replace with a proper auth context / Redux / Zustand store when a backend
// is integrated.
// ─────────────────────────────────────────────────────────────────────────────

const authStore = {
  // Last signup payload — populated by AuthPage after a successful registration
  pendingUser: null,

  // Logged-in user — set after successful login to carry state/district info
  loggedInUser: null,

  /**
   * Save signup details so the Login form can pre-fill the email field,
   * and also carry the registered state/district to the map.
   * @param {Object} userData
   */
  setSignupData(userData) {
    this.pendingUser = { ...userData };
  },

  /**
   * Retrieve (and consume) the pending signup data.
   * Returns null if there is no pending user.
   * @returns {Object|null}
   */
  getAndClearSignupData() {
    const data = this.pendingUser;
    this.pendingUser = null;
    return data;
  },

  /** Check whether a pending signup is waiting to be consumed. */
  hasPendingUser() {
    return this.pendingUser !== null;
  },

  /**
   * Store the logged-in user data (name, email, state, stateSlug, district).
   * Called on successful login so the map page can read the user's region.
   * @param {Object} userData
   */
  setLoggedInUser(userData) {
    this.loggedInUser = { ...userData };
  },

  /**
   * Retrieve the logged-in user (non-destructive).
   * @returns {Object|null}
   */
  getLoggedInUser() {
    return this.loggedInUser;
  },

  /**
   * Clear the logged-in user (logout).
   */
  clearLoggedInUser() {
    this.loggedInUser = null;
  },
};

export default authStore;
