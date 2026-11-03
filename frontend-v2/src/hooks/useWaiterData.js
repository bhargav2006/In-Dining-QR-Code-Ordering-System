import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import waiterService from '../services/waiterService';
import { useWaiterPolling } from './useWaiterPolling';
import { useToast } from '../context/ToastContext';

// Web Audio API bell chime for floor notifications
function playWaiterChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Double chime for waiter attention (G5 -> C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(783.99, now); // G5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50, now + 0.15); // C6
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.debug('Waiter audio chime not played:', e.message);
  }
}

export function useWaiterData(enabled = true) {
  const { toast } = useToast();
  const [tables, setTables] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Audio alert preference (persisted in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('waiter_sound_enabled') === 'true';
  });

  // Track processing action IDs to prevent rapid-fire clicks
  const [processingActionIds, setProcessingActionIds] = useState(new Set());

  // Track previously seen IDs for new arrival detection
  const prevReadyOrderIdsRef = useRef(new Set());
  const prevAssistanceIdsRef = useRef(new Set());
  const isInitialFetchRef = useRef(true);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('waiter_sound_enabled', String(next));
      if (next) {
        playWaiterChime();
        toast.info('Waiter audio alerts enabled');
      } else {
        toast.info('Waiter audio alerts muted');
      }
      return next;
    });
  }, [toast]);

  // Main synchronized fetcher
  const fetchAllData = useCallback(async () => {
    try {
      const [fetchedTables, fetchedOrders, fetchedAssistance] = await Promise.all([
        waiterService.getTables(),
        waiterService.getReadyOrders(),
        waiterService.getAssistanceRequests(),
      ]);

      const safeTables = Array.isArray(fetchedTables) ? fetchedTables : [];
      const safeOrders = Array.isArray(fetchedOrders) ? fetchedOrders : [];
      const safeAssistance = Array.isArray(fetchedAssistance) ? fetchedAssistance : [];

      // Check for newly arrived ready food or assistance calls
      if (!isInitialFetchRef.current) {
        const newReady = safeOrders.filter((o) => !prevReadyOrderIdsRef.current.has(o.orderId));
        const newAssistance = safeAssistance.filter((a) => !prevAssistanceIdsRef.current.has(a.id));

        if (newReady.length > 0 || newAssistance.length > 0) {
          if (soundEnabled) {
            playWaiterChime();
          }
          if (newReady.length > 0) {
            toast.success(`🍽️ ${newReady.length} order ticket${newReady.length > 1 ? 's are' : ' is'} ready from the kitchen!`);
          }
          if (newAssistance.length > 0) {
            const hasBill = newAssistance.some((a) => a.requestType === 'BILL_REQUEST');
            toast.info(`🔔 ${newAssistance.length} new customer request${newAssistance.length > 1 ? 's' : ''}${hasBill ? ' (includes Bill Request!)' : ''}`);
          }
        }
      }

      // Update refs
      prevReadyOrderIdsRef.current = new Set(safeOrders.map((o) => o.orderId));
      prevAssistanceIdsRef.current = new Set(safeAssistance.map((a) => a.id));
      isInitialFetchRef.current = false;

      setTables(safeTables);
      setReadyOrders(safeOrders);
      setAssistanceRequests(safeAssistance);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to synchronize restaurant floor data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [soundEnabled, toast]);

  // Polling every 10 seconds
  const { connectionStatus, lastPolledAt, triggerRefresh } = useWaiterPolling(fetchAllData, enabled);

  // Action: Update Table Status
  const updateTableStatus = useCallback(
    async (tableId, newStatus) => {
      const actionKey = `table-status-${tableId}`;
      if (processingActionIds.has(actionKey)) return;

      setProcessingActionIds((prev) => new Set(prev).add(actionKey));
      try {
        const updatedTable = await waiterService.updateTableStatus(tableId, newStatus);
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? { ...t, status: updatedTable.status, activeSessionToken: updatedTable.activeSessionToken } : t))
        );
        toast.success(`Table #${updatedTable.tableNumber || tableId} marked ${newStatus}`);
      } catch (err) {
        toast.error(`Failed to update table status: ${err.message}`);
      } finally {
        setProcessingActionIds((prev) => {
          const next = new Set(prev);
          next.delete(actionKey);
          return next;
        });
      }
    },
    [processingActionIds, toast]
  );

  // Action: Mark Order Served
  const markOrderServed = useCallback(
    async (orderId) => {
      const actionKey = `order-serve-${orderId}`;
      if (processingActionIds.has(actionKey)) return;

      setProcessingActionIds((prev) => new Set(prev).add(actionKey));
      try {
        const served = await waiterService.markOrderServed(orderId);
        setReadyOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        prevReadyOrderIdsRef.current.delete(orderId);
        toast.success(`Order #${served.orderNumber || orderId} served to Table #${served.tableNumber}!`);
      } catch (err) {
        toast.error(`Failed to mark order served: ${err.message}`);
      } finally {
        setProcessingActionIds((prev) => {
          const next = new Set(prev);
          next.delete(actionKey);
          return next;
        });
      }
    },
    [processingActionIds, toast]
  );

  // Action: Resolve Assistance Call
  const resolveAssistance = useCallback(
    async (requestId) => {
      const actionKey = `assist-resolve-${requestId}`;
      if (processingActionIds.has(actionKey)) return;

      setProcessingActionIds((prev) => new Set(prev).add(actionKey));
      try {
        const resolved = await waiterService.resolveAssistance(requestId);
        setAssistanceRequests((prev) => prev.filter((a) => a.id !== requestId));
        prevAssistanceIdsRef.current.delete(requestId);
        
        // If it was a bill request, the backend also frees the table, so refresh tables
        if (resolved.requestType === 'BILL_REQUEST') {
          triggerRefresh();
        }

        toast.success(`Request #${requestId} for Table #${resolved.tableNumber || '?'} resolved`);
      } catch (err) {
        toast.error(`Failed to resolve request: ${err.message}`);
      } finally {
        setProcessingActionIds((prev) => {
          const next = new Set(prev);
          next.delete(actionKey);
          return next;
        });
      }
    },
    [processingActionIds, toast, triggerRefresh]
  );

  // Action: Checkout & Liberate Table
  const checkoutTable = useCallback(
    async (tableId) => {
      const actionKey = `table-checkout-${tableId}`;
      if (processingActionIds.has(actionKey)) return;

      setProcessingActionIds((prev) => new Set(prev).add(actionKey));
      try {
        await waiterService.checkoutTable(tableId);
        // Table liberated to AVAILABLE
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? { ...t, status: 'AVAILABLE', activeSessionToken: null } : t))
        );
        toast.success(`Table checked out and released to AVAILABLE!`);
      } catch (err) {
        toast.error(`Checkout failed: ${err.message}`);
        throw err;
      } finally {
        setProcessingActionIds((prev) => {
          const next = new Set(prev);
          next.delete(actionKey);
          return next;
        });
      }
    },
    [processingActionIds, toast]
  );

  // Enriched tables with ready orders count & assistance counts
  const enrichedTables = useMemo(() => {
    return tables.map((table) => {
      const tableReadyOrders = readyOrders.filter((o) => o.tableNumber === table.tableNumber);
      const tableAssistance = assistanceRequests.filter((a) => a.tableNumber === table.tableNumber);
      return {
        ...table,
        readyOrdersCount: tableReadyOrders.length,
        readyOrders: tableReadyOrders,
        pendingAssistanceCount: tableAssistance.length,
        assistanceList: tableAssistance,
      };
    });
  }, [tables, readyOrders, assistanceRequests]);

  // Operational metrics
  const stats = useMemo(() => {
    const total = tables.length;
    const occupied = tables.filter((t) => t.status === 'OCCUPIED').length;
    const billRequested = tables.filter((t) => t.status === 'BILL_REQUESTED').length;
    const cleaningNeeded = tables.filter((t) => t.status === 'CLEANING_NEEDED').length;
    const available = tables.filter((t) => t.status === 'AVAILABLE').length;

    return {
      totalTables: total,
      occupiedCount: occupied,
      billRequestedCount: billRequested,
      cleaningNeededCount: cleaningNeeded,
      availableCount: available,
      readyOrdersCount: readyOrders.length,
      pendingAssistanceCount: assistanceRequests.length,
      occupancyRate: total > 0 ? Math.round(((occupied + billRequested) / total) * 100) : 0,
    };
  }, [tables, readyOrders, assistanceRequests]);

  return {
    tables: enrichedTables,
    readyOrders,
    assistanceRequests,
    stats,
    loading,
    error,
    connectionStatus,
    lastPolledAt,
    soundEnabled,
    processingActionIds,
    toggleSound,
    updateTableStatus,
    markOrderServed,
    resolveAssistance,
    checkoutTable,
    refreshFloor: triggerRefresh,
  };
}

export default useWaiterData;

