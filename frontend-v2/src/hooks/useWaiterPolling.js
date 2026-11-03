import { useEffect, useRef, useState, useCallback } from 'react';

const WAITER_POLL_INTERVAL_MS = 10000; // 10 seconds as per requirement

export function useWaiterPolling(callback, enabled = true) {
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'connected' | 'reconnecting' | 'error'
  const [lastPolledAt, setLastPolledAt] = useState(null);
  const isFetchingRef = useRef(false);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const executePoll = useCallback(async () => {
    // Prevent overlapping requests or polling when disabled or tab is hidden
    if (!enabled || document.visibilityState === 'hidden' || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    try {
      await callbackRef.current();
      setConnectionStatus('connected');
      setLastPolledAt(new Date());
    } catch (err) {
      console.warn('Waiter polling sync warning:', err.message);
      setConnectionStatus((prev) => (prev === 'connected' ? 'reconnecting' : 'error'));
    } finally {
      isFetchingRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Immediate initial sync
    executePoll();

    // 10s interval
    const intervalId = setInterval(executePoll, WAITER_POLL_INTERVAL_MS);

    // Tab visibility handling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        executePoll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, executePoll]);

  return {
    connectionStatus,
    lastPolledAt,
    triggerRefresh: executePoll,
  };
}

export default useWaiterPolling;

