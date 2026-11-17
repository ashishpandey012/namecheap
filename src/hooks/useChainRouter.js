import { useState, useEffect, useRef } from 'react';

export const TOTAL_PAGES = 35;
export const MIN_STEP = 3;

/**
 * Builds the nested sequential path for a given step (1 to 35):
 * Step 1: /1
 * Step 3: /1/2/3
 * Step 35: /1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20/21/22/23/24/25/26/27/28/29/30/31/32/33/34/35
 */
export function buildNestedPath(step, totalPages = TOTAL_PAGES) {
  const count = Math.max(1, Math.min(step, totalPages));
  const segments = Array.from({ length: count }, (_, i) => i + 1);
  return '/' + segments.join('/');
}

/**
 * Parses the current step number from any nested path:
 * /1/2/3.../35 -> 35
 * /1/2/3 -> 3
 */
export function parseStepFromPath(pathname, totalPages = TOTAL_PAGES) {
  if (!pathname || pathname === '/' || pathname === '') return 0;

  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 0;

  if (parts.every((part) => /^\d+$/.test(part))) {
    return Math.min(parts.length, totalPages);
  }

  const match = pathname.match(/(?:page[/-])?(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= totalPages) {
      return num;
    }
  }

  return totalPages;
}

/**
 * Custom React hook for robust step-by-step back navigation:
 * - Initializes at step 35 (/1/2/3.../35)
 * - On every Back button tap, decrements URL by EXACTLY 1 step:
 *   35 -> 34 -> 33 -> 32 -> 31 -> ... -> 4 -> 3
 * - When reaching step 3, tapping Back immediately moves back to step 35 (/1/2/3.../35)
 * - Loops perpetually without ever triggering "Leave page?" confirmation dialog
 */
export function useChainRouter({
  totalPages = TOTAL_PAGES,
  minStep = MIN_STEP,
  onBounce,
  onStepChange,
} = {}) {
  const [currentStep, setCurrentStep] = useState(totalPages);
  const currentStepRef = useRef(totalPages);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const search = window.location.search || '';
    const hash = window.location.hash || '';

    // Initialize address bar and guard history entry at step 35
    const initialPath = buildNestedPath(totalPages, totalPages) + search + hash;
    try {
      window.history.replaceState({ step: totalPages }, '', initialPath);
      window.history.pushState({ step: totalPages, guard: true }, '', initialPath);
    } catch (e) {
      console.warn('[useChainRouter] Init error:', e);
    }

    currentStepRef.current = totalPages;

    // Popstate event handler: catches every back button press on mobile
    const handlePopState = () => {
      const prevStep = currentStepRef.current;
      let nextStep = prevStep - 1;

      // When reaching below minStep (step 3), loop back to step 35
      if (nextStep < minStep) {
        nextStep = totalPages;
      }

      const nextPath =
        buildNestedPath(nextStep, totalPages) +
        (window.location.search || '') +
        (window.location.hash || '');

      try {
        // Replace popped entry with new step URL
        window.history.replaceState({ step: nextStep }, '', nextPath);
        // Push top guard entry so the browser never exhausts the history stack
        window.history.pushState({ step: nextStep, guard: true }, '', nextPath);
      } catch (e) {
        console.warn('[useChainRouter] Step error:', e);
      }

      currentStepRef.current = nextStep;
      setCurrentStep(nextStep);

      if (onStepChange) {
        onStepChange(nextStep);
      }

      if (nextStep === totalPages && onBounce) {
        onBounce();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [totalPages, minStep, onBounce, onStepChange]);

  return {
    currentStep,
    totalPages,
    minStep,
  };
}
