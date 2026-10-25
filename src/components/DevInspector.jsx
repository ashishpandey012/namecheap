import { useState } from 'react';

/**
 * DevInspector Component
 * 
 * An interactive, collapsible diagnostic drawer for developers & testers.
 * Displays real-time device signals, Samsung Internet detection, and IP location status.
 * Allows one-click simulation of eligible or fallback visitor conditions.
 */
export function DevInspector({ eligibilityDetails, setDevOverride, refresh, isEligible }) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    isMobile,
    mobileSignal,
    isSamsungBrowser,
    browserVersion,
    browserSignal,
    isUS,
    geoStatus,
    geoCountry,
    geoMessage,
    isDevOverride,
  } = eligibilityDetails;

  const handleSimulateEligible = () => {
    setDevOverride({
      isMobile: true,
      isSamsungBrowser: true,
      isUS: true,
    });
  };

  const handleSimulateNonEligible = () => {
    setDevOverride({
      isMobile: false,
      isSamsungBrowser: false,
      isUS: false,
    });
  };

  const handleResetToRealSignals = () => {
    setDevOverride(null);
    if (typeof refresh === 'function') {
      refresh();
    }
  };

  return (
    <aside className={`dev-inspector ${isOpen ? 'dev-inspector--open' : ''}`} aria-label="Developer Diagnostics">
      <button
        type="button"
        className="dev-inspector__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Toggle Audience Targeting Inspector"
      >
        <span className="dev-inspector__badge-icon" aria-hidden="true">⚙️</span>
        <span className="dev-inspector__toggle-text">
          {isOpen ? 'Close Inspector' : 'Targeting Inspector'}
        </span>
        <span
          className={`dev-inspector__status-pill ${
            isEligible ? 'status-pill--success' : 'status-pill--neutral'
          }`}
        >
          {isEligible ? 'Eligible' : 'Fallback'}
        </span>
      </button>

      {isOpen && (
        <div className="dev-inspector__panel">
          <div className="dev-inspector__header">
            <h4>Audience Targeting Signals</h4>
            <span className="dev-inspector__env">Client Signal Audit</span>
          </div>

          <div className="dev-inspector__signals">
            {/* Condition 1: Mobile */}
            <div className="signal-item">
              <div className="signal-item__title">
                <span className={`signal-indicator ${isMobile ? 'signal--pass' : 'signal--fail'}`} />
                <strong>1. Mobile Device:</strong>
                <span>{isMobile ? 'Yes' : 'No'}</span>
              </div>
              <div className="signal-item__detail">{mobileSignal}</div>
            </div>

            {/* Condition 2: Samsung Browser */}
            <div className="signal-item">
              <div className="signal-item__title">
                <span className={`signal-indicator ${isSamsungBrowser ? 'signal--pass' : 'signal--fail'}`} />
                <strong>2. Samsung Browser:</strong>
                <span>{isSamsungBrowser ? `Yes (${browserVersion || 'detected'})` : 'No'}</span>
              </div>
              <div className="signal-item__detail">{browserSignal}</div>
            </div>

            {/* Condition 3: US Location */}
            <div className="signal-item">
              <div className="signal-item__title">
                <span className={`signal-indicator ${isUS ? 'signal--pass' : 'signal--fail'}`} />
                <strong>3. US IP Location:</strong>
                <span>{isUS ? `Yes (${geoCountry || 'US'})` : `No (${geoCountry || 'N/A'})`}</span>
              </div>
              <div className="signal-item__detail">
                Status: <code>{geoStatus}</code> — {geoMessage}
              </div>
            </div>

            {/* Overall Verdict */}
            <div className="signal-summary">
              <strong>Combined Status: </strong>
              <span className={isEligible ? 'text-success' : 'text-neutral'}>
                {isEligible
                  ? '✓ All 3 Criteria Satisfied (Popup Card Active)'
                  : 'ℹ Criteria Not Met (Neutral Fallback Active)'}
              </span>
              {isDevOverride && (
                <div className="signal-override-badge">
                  * Manual simulation active
                </div>
              )}
            </div>
          </div>

          {/* Quick Simulation Controls */}
          <div className="dev-inspector__actions">
            <p className="actions-label">Quick Test Presets:</p>
            <div className="button-group">
              <button
                type="button"
                className="btn-preset btn-preset--success"
                onClick={handleSimulateEligible}
              >
                Simulate US Mobile Samsung
              </button>
              <button
                type="button"
                className="btn-preset btn-preset--neutral"
                onClick={handleSimulateNonEligible}
              >
                Simulate Non-Eligible / Desktop
              </button>
              <button
                type="button"
                className="btn-preset btn-preset--reset"
                onClick={handleResetToRealSignals}
              >
                Reset to Live Signals
              </button>
            </div>
            <div className="dev-inspector__footer-hint">
              You can also append <code>?preview=true</code> to the URL.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
