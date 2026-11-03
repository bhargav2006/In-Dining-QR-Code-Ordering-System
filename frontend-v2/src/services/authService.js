import apiClient from './apiClient';

const TOKEN_KEY = 'qr_staff_token';
const USER_KEY = 'qr_staff_user';

export const authService = {
  /**
   * Authenticate staff member with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} AuthResponseDto
   */
  async login(username, password) {
    const response = await apiClient.post('/auth/login', {
      username: username.trim(),
      password: password.trim(),
    });
    
    if (response.data && response.data.token) {
      this.setStaffSession(response.data);
    }
    return response.data;
  },

  /**
   * Save authenticated staff session to storage
   * @param {Object} authData
   */
  setStaffSession(authData) {
    if (!authData) return;
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData));
  },

  /**
   * Retrieve currently saved staff session
   * @returns {Object|null}
   */
  getCurrentStaff() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || !userStr) return null;
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing staff session:', e);
      return null;
    }
  },

  /**
   * Retrieve staff auth token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Clear active staff session (logout)
   */
  clearStaffSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Verify if staff member is currently logged in
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(this.getToken() && this.getCurrentStaff());
  },

  /**
   * Check if current staff user has one of the allowed roles
   * @param {string[]} allowedRoles
   * @returns {boolean}
   */
  hasRole(allowedRoles = []) {
    const user = this.getCurrentStaff();
    if (!user || !user.role) return false;
    const normalizedRole = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;
    return allowedRoles.some((role) => {
      const normalizedAllowed = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
      return normalizedAllowed === normalizedRole;
    });
  },
};

export default authService;

