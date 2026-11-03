import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [staffUser, setStaffUser] = useState(() => authService.getCurrentStaff());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(false);

  // Sync state if storage changes across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setStaffUser(authService.getCurrentStaff());
      setToken(authService.getToken());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      setStaffUser(data);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.clearStaffSession();
    setStaffUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = Boolean(token && staffUser);

  // Check if role is allowed for Kitchen operations: ROLE_KITCHEN or ROLE_ADMIN
  const normalizedRole = staffUser?.role
    ? (staffUser.role.startsWith('ROLE_') ? staffUser.role : `ROLE_${staffUser.role}`)
    : null;
  const isKitchenAuthorized = normalizedRole === 'ROLE_KITCHEN' || normalizedRole === 'ROLE_ADMIN';
  const isWaiterAuthorized = normalizedRole === 'ROLE_WAITER' || normalizedRole === 'ROLE_ADMIN';

  const value = {
    staffUser,
    token,
    loading,
    isAuthenticated,
    isKitchenAuthorized,
    isWaiterAuthorized,
    role: normalizedRole,
    login,
    logout,
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}

export default StaffAuthContext;

