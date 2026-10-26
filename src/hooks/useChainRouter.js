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
 * Runs the synchronous loop from /1 to /20:
 * window.history.replaceState({ page: 1, nestedStackBuilt: true }, '', '/1');
 * let currentPath = '/1';
 * for (let i = 2; i <= 20; i++) {
 *   currentPath += '/' + i;
 *   window.history.pushState({ page: i, nestedStackBuilt: true }, '', currentPath);
 * }
 */
export function buildHistoryBreadcrumbs(targetStep = TOTAL_PAGES) {
  try {
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    window.history.replaceState(
      { page: 1, nestedStackBuilt: true },
      '',
      `/1${search}${hash}`
    );

    let currentPath = '/1';
    for (let i = 2; i <= targetStep; i++) {
      currentPath += '/' + i;
      window.history.pushState(
        { page: i, nestedStackBuilt: true },
        '',
        `${currentPath}${search}${hash}`
      );
    }
  } catch (err) {
    console.warn('[useChainRouter] Error building history breadcrumbs:', err);
  }
}

/**
 * Re-seeds the remaining sequential path segments from fromStep up to targetStep:
 * When user reaches step 3 (/1/2/3), synchronously pushes segments back from 4 up to 20,
 * resetting active URL to /1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20.
 */
export function reseedFromStep(fromStep = 4, targetStep = TOTAL_PAGES) {
  try {
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    let currentPath = '/1/2/3';
    for (let i = fromStep; i <= targetStep; i++) {
      currentPath += '/' + i;
      window.history.pushState(
        { page: i, nestedStackBuilt: true },
        '',
        `${currentPath}${search}${hash}`
      );
    }
  } catch (err) {
    console.warn('[useChainRouter] Error in reseedFromStep:', err);
  }
}

/**
 * Custom React hook for:
 * 1. Un-Dismissible First-Touch Capture (NO auto-dismiss timers)
 * 2. Synchronous History Stack Building inside native touch/click handler
 * 3. Step-3 automatic bounce-back (/1/2/3): pushes 4..20 and re-enables interceptor
 * 4. Catch-all routing across all parent and nested segments
 * 5. Beforeunload protection with dialer link bypass
 */
export function useChainRouter({
  totalPages = TOTAL_PAGES,
  bounceThreshold = DEFAULT_BOUNCE_THRESHOLD,
  enableBeforeUnload = true,
  enableCaptureLayer = true,
} = {}) {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') return totalPages;
    const initialStep = parseStepFromPath(window.location.pathname, totalPages);
    return initialStep > 0 ? initialStep : totalPages;
  });

  // Un-dismissible first-touch capture state (NO timers, NO setTimeout auto-dismiss)
  const [showCaptureLayer, setShowCaptureLayer] = useState(enableCaptureLayer);
  const [captureMode, setCaptureMode] = useState('initial'); // 'initial' | 'bounce'

  const isBypassingUnloadRef = useRef(false);

  // Synchronous native gesture handler: executes the /1 to /20 loop and reveals landing page
  const handleCaptureInteraction = useCallback(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';

      if (captureMode === 'bounce') {
        // Reseed segments 4 through 20 synchronously
        reseedFromStep(bounceThreshold + 1, totalPages);
      } else {
        // Run synchronous loop from /1 to /20
        window.history.replaceState(
          { page: 1, nestedStackBuilt: true },
          '',
          `/1${search}${hash}`
        );
        let currentPath = '/1';
        for (let i = 2; i <= totalPages; i++) {
          currentPath += '/' + i;
          window.history.pushState(
            { page: i, nestedStackBuilt: true },
            '',
            `${currentPath}${search}${hash}`
          );
        }
      }

      setCurrentPage(totalPages);
    }

    // Unmount capture layer immediately after the loop without delay or flicker
    setShowCaptureLayer(false);
  }, [captureMode, bounceThreshold, totalPages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initial Stack Check on load
    const isStackBuilt = Boolean(window.history.state?.nestedStackBuilt);
    const detectedStep = parseStepFromPath(window.location.pathname, totalPages);
    if (!isStackBuilt || detectedStep === 0) {
      buildHistoryBreadcrumbs(totalPages);
    }

    // 2. Handle browser Back / Forward buttons (popstate)
    const handlePopState = (event) => {
      const currentStep = parseStepFromPath(window.location.pathname, totalPages);

      // Bounce-back threshold at Step 3 (or below):
      // When user hits Back repeatedly and pathname drops to /1/2/3 (Step 3):
      // a) Synchronously push segments back from 4 up to 20
      // b) Reset active URL to /1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20
      // c) Re-enable interaction interceptor so next user touch re-arms activation flag
      if (currentStep <= bounceThreshold) {
        reseedFromStep(bounceThreshold + 1, totalPages);
        setCurrentPage(totalPages);
        setCaptureMode('bounce');
        setShowCaptureLayer(true);
      } else if (currentStep > bounceThreshold && currentStep <= totalPages) {
        // Normal backward step (20 -> 19 -> 18 ... -> 4)
        setCurrentPage(currentStep);
      } else if (event.state && event.state.page) {
        if (event.state.page <= bounceThreshold) {
          reseedFromStep(bounceThreshold + 1, totalPages);
          setCurrentPage(totalPages);
          setCaptureMode('bounce');
          setShowCaptureLayer(true);
        } else {
          setCurrentPage(event.state.page);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // 3. Beforeunload listener to guard against tab exits
    const handleBeforeUnload = (event) => {
      if (isBypassingUnloadRef.current) return;
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    if (enableBeforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // 4. Bypass beforeunload when user clicks tel: or mailto: links
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
      if (enableBeforeUnload) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, [totalPages, bounceThreshold, enableBeforeUnload]);

  return {
    currentPage,
    totalPages,
    bounceThreshold,
    showCaptureLayer,
    captureMode,
    handleCaptureInteraction,
  };
}
