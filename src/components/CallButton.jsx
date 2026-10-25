import { siteConfig } from '../config/siteConfig.js';

/**
 * CallButton component
 * 
 * Simple, accessible, high-visibility button configured with `tel:` URI.
 * Features a solid background, white text, and a large mobile tap target.
 */
export function CallButton({ className = '', style = {} }) {
  const { phoneNumber, phoneDisplay, callButtonLabel } = siteConfig;

  return (
    <a
      href={`tel:${phoneNumber}`}
      className={`call-button ${className}`}
      style={style}
      aria-label={`${callButtonLabel}: ${phoneDisplay}`}
      id="call-now-button"
    >
      <span className="call-button-text">{callButtonLabel}</span>
      <span className="call-button-number">({phoneDisplay})</span>
    </a>
  );
}
