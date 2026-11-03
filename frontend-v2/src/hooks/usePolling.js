import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for smart background polling.
 * Automatically halts when document is hidden (background tab) and restarts when focused.
 * 
 * @param {Function} callback - Async function to run
 * @param {number} intervalMs - Polling interval in ms (default: 12000)
 * @param {boolean} enabled - Whether polling is currently active
 */
export function usePolling(callback, intervalMs = 12000, enabled = true) {
  const savedCallback = useRef(callback);
  const timerRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const execute = useCallback(() => {
    if (savedCallback.current) {
      savedCallback.current();
    }
  }, []);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startTimer = () => {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (document.visibilityState === 'visible') {
            execute();
          }
        }, intervalMs);
      }
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Trigger immediate fetch on refocus and resume timer
        execute();
        startTimer();
      } else {
        stopTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs, execute]);
}

export default usePolling;

