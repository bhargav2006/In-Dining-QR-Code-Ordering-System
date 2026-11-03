import { useState, useCallback, useRef, useEffect } from 'react';
import kitchenService from '../services/kitchenService';
import { useKitchenPolling } from './useKitchenPolling';
import { useToast } from '../context/ToastContext';

// Web Audio API chime generator for new order alert (pure synthesizer, zero external asset dependencies)
function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Pleasant dual-tone bell (E5 -> G#5)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.12); // G#5
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch (e) {
    // Audio autoplay restrictions or unsupported
    console.debug('Kitchen audio chime not played:', e.message);
  }
}

export function useKitchenOrders(restaurantId = null, enabled = true) {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('kds_sound_enabled') === 'true';
  });

  // Track processing order IDs to prevent duplicate clicks
  const [processingOrderIds, setProcessingOrderIds] = useState(new Set());

  // Track previously seen order IDs for new order arrival detection
  const previousOrderIdsRef = useRef(new Set());
  const isInitialFetchRef = useRef(true);

  // Toggle sound chime
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('kds_sound_enabled', String(next));
      if (next) {
        playKitchenChime(); // Sample chime
        toast.info('Kitchen audio alerts enabled');
      } else {
        toast.info('Kitchen audio alerts muted');
      }
      return next;
    });
  }, [toast]);

  // Main order fetcher
  const fetchOrders = useCallback(async () => {
    try {
      const data = await kitchenService.getOrders(restaurantId);
      const activeOrders = Array.isArray(data) ? data : [];

      // Check for newly arrived PLACED orders
      if (!isInitialFetchRef.current) {
        const newlyArrived = activeOrders.filter(
          (o) => o.status === 'PLACED' && !previousOrderIdsRef.current.has(o.orderId)
        );

        if (newlyArrived.length > 0) {
          if (soundEnabled) {
            playKitchenChime();
          }
          toast.info(`🔔 ${newlyArrived.length} new incoming order ticket${newlyArrived.length > 1 ? 's' : ''}!`);
        }
      }

      // Update seen order IDs
      previousOrderIdsRef.current = new Set(activeOrders.map((o) => o.orderId));
      isInitialFetchRef.current = false;

      setOrders(activeOrders);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch active kitchen queue');
      throw err; // Re-throw so polling hook captures reconnection status
    } finally {
      setLoading(false);
    }
  }, [restaurantId, soundEnabled, toast]);

  // Hook up 8-second polling
  const { connectionStatus, lastPolledAt, triggerRefresh } = useKitchenPolling(fetchOrders, enabled);

  // Start preparation: PATCH /api/kitchen/orders/{id}/status?status=PREPARING
  const startPreparing = useCallback(
    async (orderId) => {
      if (processingOrderIds.has(orderId)) return;

      setProcessingOrderIds((prev) => new Set(prev).add(orderId));
      try {
        const updated = await kitchenService.updateOrderStatus(orderId, 'PREPARING');
        
        // Optimistically update local state immediately
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: 'PREPARING', updatedAt: new Date().toISOString() } : o))
        );

        toast.success(`Order #${updated.orderNumber || orderId} moved to PREPARING`);
      } catch (err) {
        toast.error(`Failed to start preparation: ${err.message}`);
      } finally {
        setProcessingOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    },
    [processingOrderIds, toast]
  );

  // Mark ready: PATCH /api/kitchen/orders/{id}/status?status=READY
  const markReady = useCallback(
    async (orderId) => {
      if (processingOrderIds.has(orderId)) return;

      setProcessingOrderIds((prev) => new Set(prev).add(orderId));
      try {
        const updated = await kitchenService.updateOrderStatus(orderId, 'READY');
        
        // When marked READY, remove from active kitchen queue
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        previousOrderIdsRef.current.delete(orderId);

        toast.success(`Order #${updated.orderNumber || orderId} marked READY for service!`);
      } catch (err) {
        toast.error(`Failed to mark order ready: ${err.message}`);
      } finally {
        setProcessingOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    },
    [processingOrderIds, toast]
  );

  // Categorize orders
  const placedOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  // In case backend returns READY orders before waiter collects them, keep track:
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return {
    orders,
    placedOrders,
    preparingOrders,
    readyOrders,
    loading,
    error,
    connectionStatus,
    lastPolledAt,
    soundEnabled,
    processingOrderIds,
    toggleSound,
    startPreparing,
    markReady,
    refreshQueue: triggerRefresh,
  };
}

export default useKitchenOrders;

