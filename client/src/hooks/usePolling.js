import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to run a polling callback every interval (default 20 seconds).
 * Automatically pauses when the browser tab is hidden and triggers an immediate refresh
 * as soon as the tab becomes visible again.
 *
 * @param {Function} callback - Async/sync function to execute on poll
 * @param {number} intervalMs - Polling interval in milliseconds (default: 20000ms / 20s)
 * @param {boolean} enabled - Whether polling is currently active
 */
export const usePolling = (callback, intervalMs = 20000, enabled = true) => {
  const savedCallback = useRef(callback);
  const isTabVisible = useRef(!document.hidden);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const executeCallback = useCallback(() => {
    if (savedCallback.current && typeof savedCallback.current === 'function') {
      try {
        savedCallback.current();
      } catch (err) {
        console.warn('[usePolling] Error executing callback:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      isTabVisible.current = visible;

      // If becoming visible after being hidden, refresh immediately
      if (visible) {
        executeCallback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Setup periodic polling (skipped while tab is hidden)
    const interval = setInterval(() => {
      if (isTabVisible.current && !document.hidden) {
        executeCallback();
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs, executeCallback]);
};

export default usePolling;
