import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';

const TableSessionContext = createContext(null);

export function TableSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOccupiedLocked, setIsOccupiedLocked] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize or resume a table session
   */
  const initSession = useCallback(async ({ qrToken, tableNumber, restaurantId, restaurantSlug, manualSessionToken }) => {
    setIsLoading(true);
    setError(null);

    const tNum = tableNumber ? parseInt(tableNumber, 10) : null;

    // Retrieve any saved session token for this table from local storage
    let savedToken = manualSessionToken;
    if (!savedToken && tNum) {
      savedToken = localStorage.getItem(`customer_token_tbl_${tNum}`);
    }
    if (!savedToken) {
      try {
        const stored = sessionStorage.getItem('currentSession') || localStorage.getItem('currentCustomerSession');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (tNum && parsed.tableNumber === tNum) {
            savedToken = parsed.sessionToken;
          } else if (qrToken && parsed.qrToken === qrToken) {
            savedToken = parsed.sessionToken;
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    try {
      const response = await customerService.startSession({
        qrToken: qrToken || null,
        tableNumber: tNum,
        restaurantId: restaurantId ? parseInt(restaurantId, 10) : null,
        restaurantSlug: restaurantSlug || null,
        sessionToken: savedToken || null,
      });

      if (response.isOccupiedLocked) {
        setIsOccupiedLocked(true);
        setSession(response);
        // Clear stale local tokens since backend rejected them
        if (tNum) {
          localStorage.removeItem(`customer_token_tbl_${tNum}`);
          localStorage.removeItem(`customer_session_tbl_${tNum}`);
        }
      } else {
        setIsOccupiedLocked(false);
        setSession(response);

        // Persist valid active session
        if (response.sessionToken) {
          sessionStorage.setItem('currentSession', JSON.stringify(response));
          localStorage.setItem('currentCustomerSession', JSON.stringify(response));
          if (response.tableNumber) {
            localStorage.setItem(`customer_token_tbl_${response.tableNumber}`, response.sessionToken);
            localStorage.setItem(`customer_session_tbl_${response.tableNumber}`, JSON.stringify(response));
          }
        }
      }
      return response;
    } catch (err) {
      setError(err.message || 'Failed to connect to table session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Unlock an occupied table with a manual session token
   */
  const unlockWithToken = useCallback(async ({ token, tableNumber, restaurantSlug, qrToken }) => {
    return initSession({
      tableNumber,
      restaurantSlug,
      qrToken,
      manualSessionToken: token,
    });
  }, [initSession]);

  /**
   * Clear session on checkout/bill payment completion
   */
  const clearSession = useCallback(() => {
    if (session?.tableNumber) {
      localStorage.removeItem(`customer_token_tbl_${session.tableNumber}`);
      localStorage.removeItem(`customer_session_tbl_${session.tableNumber}`);
    }
    sessionStorage.removeItem('currentSession');
    localStorage.removeItem('currentCustomerSession');
    setSession(null);
    setIsOccupiedLocked(false);
  }, [session]);

  return (
    <TableSessionContext.Provider
      value={{
        session,
        sessionToken: session?.sessionToken || null,
        tableNumber: session?.tableNumber || null,
        tableStatus: session?.tableStatus || null,
        restaurant: session
          ? {
              id: session.restaurantId,
              name: session.restaurantName,
              slug: session.restaurantSlug,
              logoUrl: session.restaurantLogoUrl,
            }
          : null,
        isLoading,
        isOccupiedLocked,
        error,
        initSession,
        unlockWithToken,
        clearSession,
      }}
    >
      {children}
    </TableSessionContext.Provider>
  );
}

export function useTableSession() {
  const context = useContext(TableSessionContext);
  if (!context) {
    throw new Error('useTableSession must be used within a TableSessionProvider');
  }
  return context;
}

