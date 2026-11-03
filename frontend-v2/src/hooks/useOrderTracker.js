import { useState, useEffect, useCallback, useMemo } from 'react';
import customerService from '../services/customerService';
import usePolling from './usePolling';

export function useOrderTracker(sessionToken) {
  const [orders, setOrders] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!sessionToken) {
      setOrders([]);
      return;
    }
    try {
      const data = await customerService.getSessionOrders(sessionToken);
      setOrders(data || []);
      setError(null);
    } catch (err) {
      // Do not overwrite existing orders on occasional polling glitches
      console.warn('Orders poll failed:', err);
    }
  }, [sessionToken]);

  const fetchReceipt = useCallback(async () => {
    if (!sessionToken) return null;
    try {
      const data = await customerService.getBillReceipt(sessionToken);
      setReceipt(data);
      return data;
    } catch (err) {
      console.warn('Receipt fetch failed:', err);
      return null;
    }
  }, [sessionToken]);

  // Initial load when sessionToken changes
  useEffect(() => {
    if (sessionToken) {
      setIsLoading(true);
      fetchOrders().finally(() => setIsLoading(false));
      fetchReceipt();
    } else {
      setOrders([]);
      setReceipt(null);
    }
  }, [sessionToken, fetchOrders, fetchReceipt]);

  // Background 12s smart polling while session is active
  usePolling(fetchOrders, 12000, Boolean(sessionToken));

  /**
   * Cancel an order (backend permits only when status is PLACED)
   */
  const cancelOrder = useCallback(async (orderId) => {
    if (!sessionToken) throw new Error('No active session');
    setIsCancelling(true);
    try {
      const updatedOrder = await customerService.cancelOrder(orderId, sessionToken);
      // Optimistically update order in state
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
      // Also refresh receipt
      fetchReceipt();
      return updatedOrder;
    } catch (err) {
      throw err;
    } finally {
      setIsCancelling(false);
    }
  }, [sessionToken, fetchReceipt]);

  // Active / in-progress orders (PLACED, PREPARING, READY, SERVED)
  const activeOrdersCount = useMemo(() => {
    return orders.filter(
      (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
    ).length;
  }, [orders]);

  return {
    orders,
    receipt,
    activeOrdersCount,
    isLoading,
    isCancelling,
    error,
    refreshOrders: fetchOrders,
    refreshReceipt: fetchReceipt,
    cancelOrder,
  };
}

export default useOrderTracker;

