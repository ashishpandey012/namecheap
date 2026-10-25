import { CallButton } from './CallButton.jsx';
import { siteConfig } from '../config/siteConfig.js';

/**
 * FallbackView component
 * 
 * Displayed when targeting criteria are not met.
 * Follows the same minimal, plain white popup-style interface as the main popup,
 * with neutral customer assistance messaging and a direct Call Now option.
 */
export function FallbackView() {
  const { fallback } = siteConfig;

  return (
    <div className="popup-container" role="region" aria-labelledby="fallback-heading">
      <div className="popup-content">
        <div className="popup-body">
          <h1 id="fallback-heading" className="popup-heading">
            {fallback.heading}
          </h1>
          <p className="popup-paragraph">
            {fallback.introText}
          </p>
          <p className="popup-paragraph">
            {fallback.detailText}
          </p>
          <p className="popup-subtext">
            {fallback.subText}
          </p>
        </div>

        <div className="popup-footer">
          <CallButton />
        </div>
      </div>
    </div>
  );
}
