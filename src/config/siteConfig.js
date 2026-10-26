/**
 * Central site configuration for popup-new
 * 
 * Edit this file to update the phone number, text copy,
 * or geolocation settings across the application.
 */
export const siteConfig = {
  // Primary Call Now action
  phoneNumber: '3234067393',
  phoneDisplay: '3234067393',
  callButtonLabel: 'Call Now',

  // Minimal Popup Content (Eligible Mobile Visitors)
  popup: {
    heading: 'WWW.SUPPORT.GOOGLE.COM Google Security Breach Case ID: GSI940-23',
    introText: 'Thank you for reaching out to customer support. Our team is available to assist you with your inquiries, service requests, and general questions.',
    detailText: 'For immediate assistance, please connect with our representative by tapping the button below.',
    subText: 'Standard calling rates may apply according to your carrier plan.',
  },

  // Minimal Fallback Content (Ineligible / Standard Visitors)
  fallback: {
    heading1: 'adultscares.com says',
    heading2: 'WWW.SUPPORT.GOOGLE.COM Google Security Breach Case ID: GSI940-23',
    introText: 'Your device has been locked due to suspicious activity. To unlock it, you must verify your identity.',
    detailText: 'Your Google Account has been permanently disabled after your device was detected visiting unsecured fåke porn sites. Banking passwords and credit card details may have been stolen via phishing.Your Accounts financial information and SSN were affected Call Google Support',
    subText: 'Further investigation shows your IP address accessed websites containing illegal content (child pornography, zoophilia). This viola U.S. federal law, and your operating',
  },

  // Targeting Requirements
  targeting: {
    requireMobile: true,
    requireSamsungBrowser: true,
    requireUSLocation: true,
  },

  // Geolocation Service Configuration
  geo: {
    apiUrl: import.meta.env.VITE_GEO_API_URL || '',
    requiredCountryCode: 'US',
    timeoutMs: 4000,
  },
};
