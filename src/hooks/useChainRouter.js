import { useState, useEffect, useRef, useCallback } from 'react';

export const TOTAL_PAGES = 20;
export const DEFAULT_BOUNCE_THRESHOLD = 3;

/**
 * Builds the nested sequential path for a given step (1 to 20):
 * Step 1: /1
 * Step 2: /1/2
 * Step 20: /1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20
 */
export function buildNestedPath(step, totalPages = TOTAL_PAGES) {
  const count = Math.max(1, Math.min(step, totalPages));
  const segments = Array.from({ length: count }, (_, i) => i + 1);
  return '/' + segments.join('/');
}

/**
 * Parses the current step number from any nested or catch-all path:
 * - Nested path: /1/2/3.../20 -> 20
 * - Partial nested: /1/2/3 -> 3
 * - Flat path: /20 or /page-20 -> 20
 * - Root / or empty -> 0
 * - Unknown or wildcard -> defaults to totalPages (20) without 404
 */
export function parseStepFromPath(pathname, totalPages = TOTAL_PAGES) {
  if (!pathname || pathname === '/' || pathname === '') return 0;

  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 0;

  // Check if segments are sequential numbers (/1/2/3/4...)
  if (parts.every((part) => /^\d+$/.test(part))) {
    return Math.min(parts.length, totalPages);
  }

  // Fallback for single numbers like /20, /page/20, /page-20
  const match = pathname.match(/(?:page[/-])?(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= totalPages) {
      return num;
    }
  }

  // Catch-all route fallback: render main offer page (step 20) without 404
  return totalPages;
}

/**
 * History Stack Builder:
 * Replaces the initial entry with /1, then pushes 2..targetStep in chronological order.
 * Ensures:
 * 1. window.history.state holds { page: i, nestedStackBuilt: true }
 * 2. Top of the queue is /1/2/3.../targetStep
 * 3. 20 distinct entries exist in session history for Back navigation
 */
export function buildHistoryBreadcrumbs(targetStep = TOTAL_PAGES) {
  try {
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    // Step 1: replace initial entry with step 1 (/1)
    window.history.replaceState(
      { page: 1, nestedStackBuilt: true },
      '',
      `/1${search}${hash}`
    );

    // Steps 2 to targetStep: push sequential breadcrumbs into the history stack
    for (let i = 2; i <= targetStep; i++) {
      const currentSubPath = buildNestedPath(i, targetStep);
      window.history.pushState(
        { page: i, nestedStackBuilt: true },
        '',
        `${currentSubPath}${search}${hash}`
      );
    }
  } catch (err) {
    console.warn('[useChainRouter] Error building history breadcrumbs:', err);
  }
}

/**
 * Re-seeds the remaining sequential path segments from fromStep up to targetStep:
 * Used by the bounce-back loop when stepping back to step 3 (/1/2/3),
 * immediately replenishing 4..20 using window.history.pushState.
 * Resets the top active URL to the full 20-segment nested path.
 */
export function reseedFromStep(fromStep = 4, targetStep = TOTAL_PAGES) {
  try {
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    for (let i = fromStep; i <= targetStep; i++) {
      const currentSubPath = buildNestedPath(i, targetStep);
      window.history.pushState(
        { page: i, nestedStackBuilt: true },
        '',
        `${currentSubPath}${search}${hash}`
      );
    }
  } catch (err) {
    console.warn('[useChainRouter] Error in reseedFromStep:', err);
  }
}

/**
 * Custom React hook for:
 * 1. Automatic History Stack Builder on mount & first gesture
 * 2. Bounce-back loop at step 3 (/1/2/3): re-pushes 4..20 and bounces back to 20
 * 3. Prevents user from popping past /1/2/3 into /1/2 or /1
 * 4. Catch-all route handling across all parent and nested segments
 * 5. Ultra-responsive interaction listeners (touchmove, scroll, pointermove, wheel, etc.)
 * 6. Transparent first-touch overlay for instant gesture activation
 * 7. Beforeunload protection with dialer link bypass
 */
export function useChainRouter({
  totalPages = TOTAL_PAGES,
  bounceThreshold = DEFAULT_BOUNCE_THRESHOLD,
  enableBeforeUnload = true,
  enableFirstTouchOverlay = true,
} = {}) {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') return totalPages;
    const initialStep = parseStepFromPath(window.location.pathname, totalPages);
    return initialStep > 0 ? initialStep : totalPages;
  });

  const [showFirstTouchOverlay, setShowFirstTouchOverlay] = useState(enableFirstTouchOverlay);

  const isBypassingUnloadRef = useRef(false);
  const hasGestureSeededRef = useRef(false);

  // Activates breadcrumbs on user interaction gesture
  const triggerGestureActivation = useCallback(() => {
    if (hasGestureSeededRef.current) return;
    hasGestureSeededRef.current = true;

    if (typeof window !== 'undefined') {
      const detectedStep = parseStepFromPath(window.location.pathname, totalPages);
      const targetStep = detectedStep > 0 ? detectedStep : totalPages;
      buildHistoryBreadcrumbs(targetStep);
    }

    setShowFirstTouchOverlay(false);
  }, [totalPages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectedStep = parseStepFromPath(window.location.pathname, totalPages);
    const targetStep = detectedStep > 0 ? detectedStep : totalPages;

    // 1. Initial Stack Check on load
    const isStackBuilt = Boolean(window.history.state?.nestedStackBuilt);
    if (!isStackBuilt || detectedStep === 0) {
      buildHistoryBreadcrumbs(targetStep);
    }

    // 2. Handle browser Back / Forward buttons (popstate) with Step 3 Bounce-Back Loop
    const handlePopState = (event) => {
      const currentStep = parseStepFromPath(window.location.pathname, totalPages);

      // Bounce-back threshold at Step 3 (or below):
      // As soon as user steps back to /1/2/3 (step 3), immediately intercept,
      // re-push segments 4..totalPages back to step 20, and reset view to 20!
      if (currentStep <= bounceThreshold) {
        reseedFromStep(bounceThreshold + 1, totalPages);
        setCurrentPage(totalPages);
      } else if (currentStep > bounceThreshold && currentStep <= totalPages) {
        // Normal backward step (e.g. 20 -> 19 -> 18 ... -> 4)
        setCurrentPage(currentStep);
      } else if (event.state && event.state.page) {
        if (event.state.page <= bounceThreshold) {
          reseedFromStep(bounceThreshold + 1, totalPages);
          setCurrentPage(totalPages);
        } else {
          setCurrentPage(event.state.page);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // 3. Expanded interaction listeners:
    // Captures touchstart, touchmove, pointerdown, pointermove, click, scroll, wheel, keydown
    // to guarantee immediate user activation under Chromium & Samsung Internet heuristics.
    const interactionEvents = [
      'touchstart',
      'touchmove',
      'pointerdown',
      'pointermove',
      'click',
      'scroll',
      'wheel',
      'keydown',
    ];

    const handleInteraction = () => {
      triggerGestureActivation();
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleInteraction, { capture: true });
        document.removeEventListener(evt, handleInteraction, { capture: true });
      });
    };

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, handleInteraction, {
        capture: true,
        passive: true,
      });
      document.addEventListener(evt, handleInteraction, {
        capture: true,
        passive: true,
      });
    });

    // 4. Intercept clicks on links pointing to root to trigger chain redirect
    const handleLinkToRoot = (event) => {
      const link = event.target?.closest?.('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href, window.location.origin);
          if (url.origin === window.location.origin && (url.pathname === '/' || url.pathname === '')) {
            event.preventDefault();
            buildHistoryBreadcrumbs(totalPages);
            setCurrentPage(totalPages);
          }
        } catch {
          // ignore
        }
      }
    };

    document.addEventListener('click', handleLinkToRoot);

    // 5. Beforeunload listener to guard against tab exits
    const handleBeforeUnload = (event) => {
      if (isBypassingUnloadRef.current) return;
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    if (enableBeforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // 6. Bypass beforeunload when user clicks tel: or mailto: links
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

    return () => {
      window.removeEventListener('popstate', handlePopState);
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleInteraction, { capture: true });
        document.removeEventListener(evt, handleInteraction, { capture: true });
      });
      document.removeEventListener('click', handleLinkToRoot);
      if (enableBeforeUnload) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, [totalPages, bounceThreshold, enableBeforeUnload, triggerGestureActivation]);

  return {
    currentPage,
    totalPages,
    bounceThreshold,
    showFirstTouchOverlay,
    dismissOverlay: triggerGestureActivation,
  };
}
