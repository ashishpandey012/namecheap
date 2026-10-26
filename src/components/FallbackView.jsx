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
          <h1 id="fallback-heading" className="popup-paragraph">
            {fallback.heading1}
          </h1>
          <h1 id="fallback-heading" className="popup-heading">
            {fallback.heading}
          </h1>
          <p className="popup-paragraph">
            {fallback.introText}
          </p>
          <p className="popup-paragraph">
            {fallback.detailText}
          </p>
          <span>
            Call Google Support <a href="tel:+3234067393">+1-323-406-7393</a>
          </span>
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
