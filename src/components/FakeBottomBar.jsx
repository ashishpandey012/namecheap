/**
 * FakeBottomBar component
 * 
 * Non-functional mobile browser toolbar and Android navigation bar
 * accurately matching Attachment 2.
 */
export function FakeBottomBar() {
  const handleNonFunctionalAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="fake-mobile-bottom-bar" onClick={handleNonFunctionalAction}>
      {/* 1. Fake Mobile Browser Navigation Toolbar (Samsung Internet / Chrome Mobile) */}
      <div className="fake-browser-toolbar">
        <button type="button" className="fake-nav-btn" aria-label="Back" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button type="button" className="fake-nav-btn" aria-label="Forward" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <button type="button" className="fake-nav-btn" aria-label="Home" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        <button type="button" className="fake-nav-btn" aria-label="Bookmarks" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>

        <button type="button" className="fake-nav-btn" aria-label="Tabs" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <div className="fake-tabs-icon">1</div>
        </button>

        <button type="button" className="fake-nav-btn fake-menu-btn" aria-label="Menu" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span className="fake-menu-dot" />
        </button>
      </div>

      {/* 2. Fake Android System Navigation Bar (Dark) */}
      <div className="fake-system-navbar">
        <button type="button" className="fake-sys-btn" aria-label="Recent Apps" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c9096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
        </button>

        <button type="button" className="fake-sys-btn" aria-label="System Home" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <div className="fake-home-circle">
            <div className="fake-home-inner-dot"></div>
          </div>
        </button>

        <button type="button" className="fake-sys-btn" aria-label="System Back" tabIndex={-1} onClick={handleNonFunctionalAction}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c9096" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      {/* 3. Android Home Gesture Pill Indicator */}
      <div className="fake-gesture-bar">
        <div className="fake-gesture-pill" />
      </div>
    </div>
  );
}
