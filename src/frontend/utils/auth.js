/**
 * Authentication utilities
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Get the current user information from the token
 * @returns {Object|null} The user information or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    
    // Decode the JWT token (very basic version)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    removeAuthToken();
    return null;
  }
};

/**
 * Check if the user has the specified role
 * @param {string|string[]} roles - The role(s) to check
 * @returns {boolean} True if the user has any of the specified roles, false otherwise
 */
export const hasRole = (roles) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};
