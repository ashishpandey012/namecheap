# popup-new

A modern, mobile-first single-page React website built with **React 19**, **Vite 8**, and vanilla CSS. Designed as a clean, minimal white popup dialog occupying ~95% of the mobile viewport, featuring direct phone connection and audience targeting.

---

## 1. Visual Interface

- **Popup Dimensions:** Occupies approximately **95% of viewport width (`95vw`)** and **95% of viewport height (`95dvh`)**, leaving a clean ~2.5% margin around the popup box on mobile screens.
- **Design:** Pure white background (`#ffffff`), simple black text, clean rounded corners, and a subtle border. Free of distracting gradients, badges, illustrations, or landing-page layouts.
- **Content:**
  - Simple heading at top ("Customer Support").
  - Plain, informative placeholder text.
  - One prominent, solid "Call Now" button anchored at the bottom.
  - Internal scrolling is enabled only if necessary on compact mobile screens.
- **Neutral Fallback:** Ineligible visitors (or non-mobile visitors) see the same clean, minimal white popup dialog with standard assistance messaging instead of an elaborate multi-section portal.

---

## 2. Central Configuration (Phone Number & Copy)

All phone numbers, display text, and targeting rules are maintained in one central configuration file:
👉 **[`src/config/siteConfig.js`](file:///c:/Users/Ashish%20Pandey/Desktop/popup-new/src/config/siteConfig.js)**

```javascript
export const siteConfig = {
  // Primary Call Now action
  phoneNumber: '+1-323-406-7393',        // E.164 destination number for tel: link
  phoneDisplay: '+1-323-406-7393',  // Human-readable formatted string
  callButtonLabel: 'Call Now',

  // Minimal Popup Content (Eligible Mobile Visitors)
  popup: {
    heading: 'Customer Support',
    introText: 'Thank you for reaching out to customer support. Our team is available to assist you with your inquiries, service requests, and general questions.',
    detailText: 'For immediate assistance, please connect with our representative by tapping the button below.',
    subText: 'Standard calling rates may apply according to your carrier plan.',
  },

  // Minimal Fallback Content (Ineligible / Standard Visitors)
  fallback: {
    heading: 'Customer Assistance',
    introText: 'Welcome to the customer assistance portal. If you need help with your services or have questions, our representative team is available to help.',
    detailText: 'You may connect directly with our support desk using the contact option below.',
    subText: 'Standard calling rates may apply according to your carrier plan.',
  },
  // ...
};
```

---

## 3. Browser & Device Targeting

The targeting engine in `src/services/eligibilityService.js` evaluates:
1. **Mobile Device:** Evaluates `navigator.userAgentData.mobile`, mobile UA regex, and touch points + viewport width.
2. **Samsung Internet:** Evaluates `SamsungBrowser/` token and User-Agent Client Hints brands.
3. **US IP Location:** Queries the configured IP geolocation endpoint (via `VITE_GEO_API_URL` or fallback `https://api.country.is/`). Does not assume browser timezone or language proves US location.

> **Targeting Limitations:** Client-side signals can be altered or spoofed by visitors. For legally or contractually binding restrictions, validation must be enforced server-side.

---

- **History & Back Button Retention:** Automatically intercepts browser back actions via HTML5 `popstate` to ensure the visitor remains on the popup interface rather than navigating away to previous pages.
- **Clean Execution:** Operates cleanly without page reloads, infinite redirect loops, or browser freezing.
- Reopening or refreshing the URL consistently renders the same home interface.
- Developer diagnostic controls are only available during development (`import.meta.env.DEV`) and are stripped from production builds.

---

## 5. Development & Deployment

### Run Locally
```bash
npm run dev
```
Development server will run at `http://localhost:5173/`.

### Run Linter
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
Generates production-ready static assets in `dist/`.

### Preview Build
```bash
npm run preview
```

### Deploying
The output in `dist/` can be deployed directly to Vercel, Netlify, Cloudflare Pages, or any static hosting server (Nginx/Apache).
