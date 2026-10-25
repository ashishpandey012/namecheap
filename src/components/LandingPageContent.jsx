import { PopupCard } from './PopupCard.jsx';
import { FallbackView } from './FallbackView.jsx';
import { DevInspector } from './DevInspector.jsx';

/**
 * LandingPageContent component
 * 
 * Reusable content rendered identically across all 20 pages.
 * Displays the same UI (PopupCard or FallbackView) and prominent CallButton.
 *
 * @param {Object} props
 * @param {number} [props.pageNumber=1] - The page number in the chain (1-20).
 * @param {boolean} props.isLoading
 * @param {boolean} props.isEligible
 * @param {Object} props.eligibilityDetails
 * @param {Function} props.setDevOverride
 * @param {Function} props.refresh
 */
export function LandingPageContent({
  pageNumber = 1,
  isLoading,
  isEligible,
  eligibilityDetails,
  setDevOverride,
  refresh,
}) {
  return (
    <div className="page-wrapper" data-page={pageNumber}>
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
