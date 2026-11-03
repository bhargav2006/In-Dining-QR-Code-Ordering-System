import { useEffect, useRef, useState, useCallback } from 'react';

const KITCHEN_POLL_INTERVAL_MS = 8000; // 8 seconds as per requirement

export function useKitchenPolling(callback, enabled = true) {
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
      console.warn('Kitchen polling sync warning:', err.message);
      setConnectionStatus((prev) => (prev === 'connected' ? 'reconnecting' : 'error'));
    } finally {
      isFetchingRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Trigger immediate poll on mount
    executePoll();

    // Setup 8-second interval
    const intervalId = setInterval(executePoll, KITCHEN_POLL_INTERVAL_MS);

    // Handle tab visibility changes (pause when hidden, immediate sync when visible)
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

export default useKitchenPolling;

