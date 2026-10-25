import { CallButton } from './CallButton.jsx';
import { siteConfig } from '../config/siteConfig.js';

/**
 * PopupCard component
 * 
 * Minimal, plain white popup dialog occupying ~95% of mobile viewport width & height.
 * Simple black heading, informational text, and one prominent Call Now button at the bottom.
 */
export function PopupCard() {
  const { popup } = siteConfig;

  return (
    <div className="popup-container" role="dialog" aria-modal="true" aria-labelledby="popup-heading">
      <div className="popup-content">
        <div className="popup-body">
          <h1 id="popup-heading" className="popup-heading">
            {popup.heading}
          </h1>
          <p className="popup-paragraph">
            {popup.introText}
          </p>
          <p className="popup-paragraph">
            {popup.detailText}
          </p>
          <p className="popup-subtext">
            {popup.subText}
          </p>
        </div>

        <div className="popup-footer">
          <CallButton />
        </div>
      </div>
    </div>
  );
}
