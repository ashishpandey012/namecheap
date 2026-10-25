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
  enableBeforeUnload = true,
} = {}) {
  const hasSeededRef = useRef(false);
  const isBypassingUnloadRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Immediately push dummy history state on mount
    try {
      window.history.pushState(null, '', window.location.href);
    } catch (err) {
      console.warn('[useBackTrap] Initial pushState error:', err);
    }

    // 2. Attach popstate event listener: whenever back is triggered, re-push current URL
    const handlePopState = () => {
      try {
        window.history.pushState(null, '', window.location.href);
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
        const baseHref = window.location.href;
        const currentUrl = new URL(baseHref);

        // Pre-seed entries (?step=1, ?step=2, ...)
        for (let i = 1; i <= seedCount; i++) {
          const stepUrl = new URL(currentUrl.href);
          stepUrl.searchParams.set('step', String(i));
          window.history.pushState(null, '', stepUrl.toString());
        }

        // Return the address bar to the clean base URL at the top of the stack
        window.history.pushState(null, '', baseHref);
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

    // 4. Beforeunload listener to prevent unintended swift tab exits
    const handleBeforeUnload = (event) => {
      if (isBypassingUnloadRef.current) return;
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    if (enableBeforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Bypass beforeunload when user taps on tel: or mailto: links so calls trigger cleanly
    const handleLinkClick = (event) => {
      const link = event.target?.closest?.('a');
      if (link && link.href && (link.href.startsWith('tel:') || link.href.startsWith('mailto:'))) {
        isBypassingUnloadRef.current = true;
        setTimeout(() => {
          isBypassingUnloadRef.current = false;
        }, 3000);
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });

    // Cleanup listeners if component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleFirstInteraction, { capture: true });
      });
      if (enableBeforeUnload) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, [enabled, seedCount, enableBeforeUnload]);
}

/**
 * Reusable BackTrap component wrapper
 */
export function BackTrap(props) {
  useBackTrap(props);
  return null;
}
