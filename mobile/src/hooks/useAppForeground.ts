import { useEffect, useRef } from 'react';
import { AppState } from '../native/AppState';

/**
 * Runs `onForeground` every time the app comes back to the foreground: the user
 * switches back to it, unlocks the phone, and so on.
 */
export function useAppForeground(onForeground: () => void) {
  // Always call the latest callback, so the effect below only needs to run once.
  const latest = useRef(onForeground);
  latest.current = onForeground;

  useEffect(() => {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') latest.current();
    });
  }, []);
}
