import { useEligibility } from './hooks/useEligibility.js';
import { useChainRouter } from './hooks/useChainRouter.js';
import { PAGE_MAP } from './pages/index.js';
import { LandingPageContent } from './components/LandingPageContent.jsx';
import { InteractionModal } from './components/InteractionModal.jsx';
import './App.css';

function App() {
  const {
    isEligible,
    isLoading,
    details: eligibilityDetails,
    setDevOverride,
    refresh,
  } = useEligibility();

  // Dynamic / Wildcard catch-all route handler with un-dismissible first-touch capture
  // and step-3 bounce-back history re-arming
  const {
    currentPage,
    showCaptureLayer,
    captureMode,
    handleCaptureInteraction,
  } = useChainRouter({
    totalPages: 20,
    bounceThreshold: 3,
    enableBeforeUnload: true,
    enableCaptureLayer: true,
  });

  // Select the appropriate Page component (Page1 to Page20)
  const ActivePageComponent = PAGE_MAP[currentPage] || LandingPageContent;

  return (
    <>
      {/* 1. Un-Dismissible First-Touch Capture & Step-3 Re-Arming Interceptor */}
      <InteractionModal
        isOpen={showCaptureLayer}
        mode={captureMode}
        onAction={handleCaptureInteraction}
      />

      {/* 2. Catch-All Main Landing Page Content */}
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
