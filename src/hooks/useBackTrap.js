import { useEffect, useRef } from 'react';

/**
 * Custom React hook for aggressive back-button trapping and history looping.
 *
 * Designed to keep users on the landing page even when they press device/browser 'Back'.
 * Works against Chromium & Samsung Internet 'History Manipulation Intervention' heuristics
 * by pre-seeding dummy entries upon the first user interaction.
 *
 * @param {Object} options
 * @param {boolean} [options.enabled=true] - Whether the back trap is active.
 * @param {number} [options.seedCount=10] - Number of dummy history entries to push on first interaction (e.g., 5-10).
 * @param {boolean} [options.enableBeforeUnload=true] - Whether to attach a beforeunload confirmation dialog.
 */
export function useBackTrap({
  enabled = true,
  seedCount = 10,
} = {}) {
  const hasSeededRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Immediately push dummy history state on mount with clean path
    try {
      window.history.pushState({ trap: true }, '', window.location.pathname);
    } catch (err) {
      console.warn('[useBackTrap] Initial pushState error:', err);
    }

    // 2. Attach popstate event listener: whenever back is triggered, re-push clean pathname
    const handlePopState = () => {
      try {
        window.history.pushState({ trap: true }, '', window.location.pathname);
      } catch (err) {
        console.warn('[useBackTrap] Popstate replenishment error:', err);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // 3. Intercept first user touch/click to pre-seed 5 to 10 dummy history entries
    // This satisfies user activation gestures so Samsung Internet / Chrome do not skip entries.
    const preSeedEntries = () => {
      if (hasSeededRef.current) return;
      hasSeededRef.current = true;

      try {
        // Pre-seed history entries with clean URL (no query params or page segments)
        for (let i = 1; i <= seedCount; i++) {
          window.history.pushState({ trap: true, depth: i }, '', window.location.pathname);
        }
      } catch (err) {
        console.warn('[useBackTrap] Pre-seeding history error:', err);
      }
    };

    const interactionEvents = ['touchstart', 'click', 'pointerdown'];

    const handleFirstInteraction = () => {
      preSeedEntries();
      // Remove interaction listeners once pre-seeded
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleFirstInteraction, { capture: true });
      });
    };

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, handleFirstInteraction, {
        capture: true,
        passive: true,
      });
    });

    // Cleanup listeners if component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleFirstInteraction, { capture: true });
      });
    };
  }, [enabled, seedCount]);
}

/**
 * Reusable BackTrap component wrapper
 */
export function BackTrap(props) {
  useBackTrap(props);
  return null;
}
