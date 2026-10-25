import { useEffect } from 'react';
import { useEligibility } from './hooks/useEligibility.js';
import { PopupCard } from './components/PopupCard.jsx';
import { FallbackView } from './components/FallbackView.jsx';
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

  // Back button prevention: ensures the page does not navigate away
  // and stays on the popup interface when the user presses Back.
  useEffect(() => {
    if (!isLoading) {
      // Push an extra history entry so the browser back button can be intercepted
      window.history.pushState({ page: 'popup' }, '', window.location.href);

      const handlePopState = () => {
        // When user tries to go back, push state again to keep them on the popup
        window.history.pushState({ page: 'popup' }, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isLoading]);

  return (
    <div className="page-wrapper">
      {isLoading ? (
        <div className="popup-container" role="status" aria-live="polite">
          <div className="popup-content">
            <div className="popup-body">
              <h1 className="popup-heading">Loading...</h1>
              <p className="popup-paragraph">Connecting to customer support...</p>
            </div>
          </div>
        </div>
      ) : isEligible ? (
        <PopupCard />
      ) : (
        <FallbackView />
      )}

      {/* Developer targeting inspector - only active in dev mode, never in production */}
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
