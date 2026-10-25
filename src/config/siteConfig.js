/**
 * Central site configuration for popup-new
 * 
 * Edit this file to update the phone number, text copy,
 * or geolocation settings across the application.
 */
export const siteConfig = {
  // Primary Call Now action
  phoneNumber: '+10000000000',
  phoneDisplay: '+1 (000) 000-0000',
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
