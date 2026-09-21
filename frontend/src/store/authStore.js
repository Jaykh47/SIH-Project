// frontend/src/store/authStore.js
// Holds temporary auth state between Sign Up and Login, and carries location data.

const authStore = {
  // Last signup payload — populated by AuthPage/Sign-Up form
  pendingUser: null,

  // Logged-in user data carrying state / district / region info
  loggedInUser: null,

  setSignupData(userData) {
    this.pendingUser = { ...userData };
  },

  getAndClearSignupData() {
    const data = this.pendingUser;
    this.pendingUser = null;
    return data;
  },

  hasPendingUser() {
    return this.pendingUser !== null;
  },

  setLoggedInUser(userData) {
    this.loggedInUser = { ...userData };
  },

  getLoggedInUser() {
    return this.loggedInUser;
  },

  clearLoggedInUser() {
    this.loggedInUser = null;
  },
};

export default authStore;
