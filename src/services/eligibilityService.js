import { siteConfig } from '../config/siteConfig.js';

/**
 * Result structure returned by eligibility evaluation
 * @typedef {Object} EligibilityResult
 * @property {boolean} isEligible - Whether all 3 conditions are satisfied
 * @property {boolean} isLoading - Whether asynchronous checks (e.g. geo) are in progress
 * @property {Object} details - Detailed breakdown of each condition
 * @property {boolean} details.isMobile - Mobile device detection result
 * @property {boolean} details.isSamsungBrowser - Samsung Internet detection result
 * @property {boolean} details.isUS - US location verification result
 * @property {string} details.geoStatus - Status of geo check ('VERIFIED_US' | 'VERIFIED_NON_US' | 'UNVERIFIED' | 'CONFIG_MISSING' | 'API_FAILED')
 * @property {string} details.geoCountry - Detected ISO country code (or null)
 * @property {string} details.browserVersion - Detected Samsung Browser version (if any)
 * @property {string} details.notes - Human-readable diagnostic summary
 */

/**
 * Detects whether the current client is a mobile device.
 * Uses User-Agent Client Hints (if available), standard User-Agent string,
 * max touch points, and screen viewport signals.
 *
 * @returns {{ isMobile: boolean, signal: string }}
 */
export function checkMobileDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isMobile: false, signal: 'Server/Node environment' };
  }

  // 1. Check User-Agent Client Hints (modern Chromium standard)
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
    if (navigator.userAgentData.mobile) {
      return { isMobile: true, signal: 'navigator.userAgentData.mobile = true' };
    }
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera || '';

  // 2. Comprehensive Mobile Regex (phones, phablets, mobile browsers)
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|Silk\/|Kindle|Symbian|WPDesktop/i;
  const isUaMobile = mobileRegex.test(ua);

  // 3. Hardware touch capability and screen dimension signals
  const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;
  const isNarrowScreen = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;

  const isMobile = isUaMobile || (hasTouch && isNarrowScreen);

  return {
    isMobile,
    signal: isUaMobile
      ? 'User-Agent mobile regex match'
      : hasTouch && isNarrowScreen
      ? 'Touch device with narrow viewport'
      : 'Desktop/Tablet non-mobile signature',
  };
}

/**
 * Detects whether the current client is Samsung Internet Browser.
 * Checks for the 'SamsungBrowser/' token in the user agent string
 * and inspects navigator.userAgentData.brands if available.
 *
 * NOTE: User-agent strings can be altered or spoofed. This client-side
 * check is an audience hint; authoritative validation requires server-side controls.
 *
 * @returns {{ isSamsung: boolean, version: string | null, signal: string }}
 */
export function checkSamsungBrowser() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isSamsung: false, version: null, signal: 'Server/Node environment' };
  }

  const ua = navigator.userAgent || '';

  // 1. Check standard SamsungBrowser signature in UA
  const match = ua.match(/SamsungBrowser\/([0-9.]+)/i);
  if (match) {
    return {
      isSamsung: true,
      version: match[1] || 'Unknown',
      signal: `User-Agent contains SamsungBrowser/${match[1]}`,
    };
  }

  // 2. Check Client Hints brands (some Samsung Internet builds report brand name)
  if (navigator.userAgentData && Array.isArray(navigator.userAgentData.brands)) {
    const samsungBrand = navigator.userAgentData.brands.find((b) =>
      /Samsung/i.test(b.brand)
    );
    if (samsungBrand) {
      return {
        isSamsung: true,
        version: samsungBrand.version || 'Unknown',
        signal: `Client Hints brand: ${samsungBrand.brand}`,
      };
    }
  }

  return {
    isSamsung: false,
    version: null,
    signal: 'Not Samsung Internet browser',
  };
}

/**
 * Resolves visitor's location using configured IP Geolocation service.
 * Respects strict requirements:
 * - Does NOT infer US location from language, timezone, or locale.
 * - Handles API failures, CORS blocks, and timeouts gracefully.
 * - Reports accurate status enum and never falsely claims verification.
 *
 * @returns {Promise<{ isUS: boolean, status: string, country: string | null, message: string }>}
 */
export async function checkUSLocation() {
  const customApiUrl = siteConfig.geo.apiUrl;
  const timeoutMs = siteConfig.geo.timeoutMs || 4500;
  const requiredCode = (siteConfig.geo.requiredCountryCode || 'US').toUpperCase();

  // Primary URL or fallback endpoint
  // https://api.country.is/ is a fast, CORS-enabled, no-auth IP-to-country lookup
  const targetUrl = customApiUrl || 'https://api.country.is/';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isUS: false,
        status: 'API_FAILED',
        country: null,
        message: `Location service responded with HTTP status ${response.status}`,
      };
    }

    const data = await response.json();
    // Normalize country field across different provider formats (country, country_code, countryCode)
    const detectedCountry = (
      data.country ||
      data.country_code ||
      data.countryCode ||
      data.country_code_iso3 ||
      ''
    ).toUpperCase();

    if (!detectedCountry) {
      return {
        isUS: false,
        status: 'UNVERIFIED',
        country: null,
        message: 'Location service response did not contain country code',
      };
    }

    const isUS = detectedCountry === requiredCode;

    return {
      isUS,
      status: isUS ? 'VERIFIED_US' : 'VERIFIED_NON_US',
      country: detectedCountry,
      message: isUS
        ? `Verified US visitor via IP service (${detectedCountry})`
        : `Visitor detected outside required region (${detectedCountry})`,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    const isTimeout = error.name === 'AbortError';
    const isNetwork = error instanceof TypeError;

    return {
      isUS: false,
      status: 'API_FAILED',
      country: null,
      message: isTimeout
        ? `Location service timed out after ${timeoutMs}ms`
        : isNetwork
        ? 'Network request failed (possibly blocked by ad-blocker or CORS)'
        : error.message || 'Unknown location service error',
    };
  }
}

/**
 * Evaluates all 3 audience criteria:
 * 1. Mobile device
 * 2. Samsung Internet browser
 * 3. US Location (via IP service)
 *
 * @param {Object} [overrides] - Optional overrides for testing/dev inspection
 * @returns {Promise<EligibilityResult>}
 */
export async function evaluateEligibility(overrides = {}) {
  const mobileResult = checkMobileDevice();
  const samsungResult = checkSamsungBrowser();

  const isMobile =
    typeof overrides.isMobile === 'boolean'
      ? overrides.isMobile
      : mobileResult.isMobile;

  const isSamsungBrowser =
    typeof overrides.isSamsungBrowser === 'boolean'
      ? overrides.isSamsungBrowser
      : samsungResult.isSamsung;

  let geoResult;
  if (typeof overrides.isUS === 'boolean') {
    geoResult = {
      isUS: overrides.isUS,
      status: overrides.isUS ? 'VERIFIED_US' : 'VERIFIED_NON_US',
      country: overrides.isUS ? 'US' : 'XX',
      message: 'Dev manual override applied for location check',
    };
  } else {
    geoResult = await checkUSLocation();
  }

  // All 3 conditions must be satisfied if configured
  const reqMobile = siteConfig.targeting.requireMobile ? isMobile : true;
  const reqSamsung = siteConfig.targeting.requireSamsungBrowser
    ? isSamsungBrowser
    : true;
  const reqUS = siteConfig.targeting.requireUSLocation ? geoResult.isUS : true;

  const isEligible = reqMobile && reqSamsung && reqUS;

  return {
    isEligible,
    isLoading: false,
    details: {
      isMobile,
      mobileSignal: mobileResult.signal,
      isSamsungBrowser,
      browserVersion: samsungResult.version,
      browserSignal: samsungResult.signal,
      isUS: geoResult.isUS,
      geoStatus: geoResult.status,
      geoCountry: geoResult.country,
      geoMessage: geoResult.message,
      isDevOverride: Object.keys(overrides).length > 0,
    },
  };
}
