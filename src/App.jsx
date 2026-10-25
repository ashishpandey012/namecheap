import { useEligibility } from './hooks/useEligibility.js';
import { useChainRouter } from './hooks/useChainRouter.js';
import { PAGE_MAP } from './pages/index.js';
import { LandingPageContent } from './components/LandingPageContent.jsx';
import './App.css';

function App() {
  const {
    isEligible,
    isLoading,
    details: eligibilityDetails,
    setDevOverride,
    refresh,
  } = useEligibility();

  // Dynamic / Wildcard catch-all route handler with instant first-touch gesture activation
  const {
    currentPage,
    showFirstTouchOverlay,
    dismissOverlay,
  } = useChainRouter({
    totalPages: 20,
    bounceThreshold: 3,
    enableBeforeUnload: true,
    enableFirstTouchOverlay: true,
  });

  // Select the appropriate Page component (Page1 to Page20)
  const ActivePageComponent = PAGE_MAP[currentPage] || LandingPageContent;

  return (
    <>
      {/* Transparent first-touch overlay: instantly activates history queue upon the slightest screen tap */}
      {showFirstTouchOverlay && (
        <div
          id="first-touch-layer"
          className="first-touch-overlay"
          onPointerDown={dismissOverlay}
          onTouchStart={dismissOverlay}
          onClick={dismissOverlay}
          aria-hidden="true"
        />
      )}

      <ActivePageComponent
        pageNumber={currentPage}
        isLoading={isLoading}
        isEligible={isEligible}
        eligibilityDetails={eligibilityDetails}
        setDevOverride={setDevOverride}
        refresh={refresh}
      />
    </>
  );
}

export default App;
