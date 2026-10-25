import { useState, useEffect, useCallback } from 'react';
import { evaluateEligibility } from '../services/eligibilityService.js';

const STORAGE_OVERRIDE_KEY = 'popup_targeting_override';

/**
 * Custom React hook to evaluate audience targeting criteria:
 * - Mobile device
 * - Samsung Internet Browser
 * - US Location (via verified IP service)
 * 
 * Supports dev overrides via query params (?preview=true) or localStorage.
 */
export function useEligibility() {
  const [eligibility, setEligibility] = useState({
    isEligible: false,
    isLoading: true,
    details: {
      isMobile: false,
      mobileSignal: 'Initializing...',
      isSamsungBrowser: false,
      browserVersion: null,
      browserSignal: 'Initializing...',
      isUS: false,
      geoStatus: 'UNVERIFIED',
      geoCountry: null,
      geoMessage: 'Initializing location check...',
      isDevOverride: false,
    },
  });

  const [overrides, setOverrides] = useState(() => {
    if (typeof window === 'undefined') return null;

    // 1. Check URL query params for convenient testing
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === 'true') {
      return { isMobile: true, isSamsungBrowser: true, isUS: true };
    }
    if (params.get('force_fallback') === 'true') {
      return { isMobile: false, isSamsungBrowser: false, isUS: false };
    }

    // 2. Check saved overrides in localStorage
    try {
      const saved = localStorage.getItem(STORAGE_OVERRIDE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors
    }

    return null;
  });

  useEffect(() => {
    let isCancelled = false;

    evaluateEligibility(overrides || {})
      .then((result) => {
        if (!isCancelled) {
          setEligibility(result);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setEligibility({
            isEligible: false,
            isLoading: false,
            details: {
              isMobile: false,
              mobileSignal: 'Evaluation failed',
              isSamsungBrowser: false,
              browserVersion: null,
              browserSignal: 'Evaluation failed',
              isUS: false,
              geoStatus: 'API_FAILED',
              geoCountry: null,
              geoMessage: err.message || 'Unknown evaluation failure',
              isDevOverride: Boolean(overrides),
            },
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [overrides]);

  // Handler to update or clear developer overrides
  const setDevOverride = useCallback((newOverrides) => {
    if (newOverrides === null) {
      try {
        localStorage.removeItem(STORAGE_OVERRIDE_KEY);
      } catch {
        // ignore
      }
      setOverrides(null);
    } else {
      try {
        localStorage.setItem(STORAGE_OVERRIDE_KEY, JSON.stringify(newOverrides));
      } catch {
        // ignore
      }
      setOverrides(newOverrides);
    }
  }, []);

  const refresh = useCallback(() => {
    setEligibility((prev) => ({ ...prev, isLoading: true }));
    evaluateEligibility(overrides || {})
      .then((result) => setEligibility(result))
      .catch((err) => {
        setEligibility({
          isEligible: false,
          isLoading: false,
          details: {
            isMobile: false,
            mobileSignal: 'Evaluation failed',
            isSamsungBrowser: false,
            browserVersion: null,
            browserSignal: 'Evaluation failed',
            isUS: false,
            geoStatus: 'API_FAILED',
            geoCountry: null,
            geoMessage: err.message || 'Unknown evaluation failure',
            isDevOverride: Boolean(overrides),
          },
        });
      });
  }, [overrides]);

  return {
    ...eligibility,
    overrides,
    setDevOverride,
    refresh,
  };
}
