/* ============================================================
   RIVERBEND ART — Central Configuration
   Edit this file to change pricing, IDs, and feature flags.
   ============================================================ */

/* --- Analytics IDs ---
   Replace these placeholders after setting up your accounts.
   GA4:     https://analytics.google.com
   Clarity: https://clarity.microsoft.com
   ----------------------------------------------------------- */
const ANALYTICS_CONFIG = {
    GA4_MEASUREMENT_ID: 'G-K8RTW7265V',
    CLARITY_PROJECT_ID: 'woy71wgoeo'
};

/* --- PayPal ---
   Replace with your PayPal Business client ID.
   https://developer.paypal.com → My Apps & Credentials

   PAYPAL_SANDBOX_MODE: true  → Uses PayPal's test environment. Real checkout
     UI runs end-to-end (button renders, order creates, capture fires) but no
     real money moves. Use this while testing. Requires a sandbox client ID.
   PAYPAL_SANDBOX_MODE: false → Live mode. Real payments. Only set this when
     you are ready to go live and have replaced both client IDs below.
   ----------------------------------------------------------- */
const PAYPAL_CONFIG = {
    CLIENT_ID:          'AdexWbz2QVTTNIjbhWn4_9vj7v6nOfBkcHXxiCFtiOSF_tvkVnphZh5WiPE_3669GvHJEtl7tq-GBwYo',    // Live client ID
    SANDBOX_CLIENT_ID:  'AfsfyMNu3TsYlKo05woB046ZgWtFJHMqT5r3xh8HGv7-kLNiEqZ42Z_UFbSJ4c7S0OjInFGZSnGn5UWb', // Sandbox client ID
    CURRENCY: 'USD',
    INTENT:   'capture',
    PAYPAL_SANDBOX_MODE: false   // ← Set to false only when going live
};

/* --- Print Pricing ---
   Shipping is included in these prices (continental US).
   Add new size objects here to extend without changing UI code.
   ----------------------------------------------------------- */
const PRINT_OPTIONS = [
    {
        size: '8×10',
        label: '8×10 in.',
        price: 45,
        printCostEstimate: 12,
        shippingIncluded: true,
        shippingRegion: 'Continental US'
    },
    {
        size: '11×14',
        label: '11×14 in.',
        price: 70,
        printCostEstimate: 22,
        shippingIncluded: true,
        shippingRegion: 'Continental US'
    },
    {
        size: '16×20',
        label: '16×20 in.',
        price: 120,
        printCostEstimate: 38,
        shippingIncluded: true,
        shippingRegion: 'Continental US'
    }
    /* Future options can be added here:
    {
        size: 'canvas-16x20',
        label: '16×20 in. Canvas',
        price: 180,
        printCostEstimate: 65,
        shippingIncluded: true,
        shippingRegion: 'Continental US'
    },
    {
        size: 'framed-11x14',
        label: '11×14 in. Framed',
        price: 145,
        printCostEstimate: 60,
        shippingIncluded: true,
        shippingRegion: 'Continental US'
    } */
];

/* --- Site Feature Flags ---
   Toggle features without touching UI code.
   ----------------------------------------------------------- */
const FEATURES = {
    cart: true,              // Show cart / print ordering
    analytics: true,         // Load GA4 + Clarity
    printCollection: true,   // Show "Print Collection" filter tab
    paymentsLive: true       // ← Set to true when PayPal account is approved and live
                             //   credentials are in place. Until then, a "coming soon"
                             //   notice replaces the PayPal button so real visitors
                             //   are never shown a non-functional sandbox checkout.
};

/* --- Debug Mode ---
   DEBUG_MODE: true  → Logs analytics events, cart changes, and PayPal flow to
     the browser console with prefixed labels. Flip this on while testing so
     you can verify every event fires correctly before going live.
   DEBUG_MODE: false → Silent in production. No console output from this app.

   IMPORTANT: Always set DEBUG_MODE to false before deploying to production.
   ----------------------------------------------------------- */
const DEBUG_MODE = false;   // ← Set to true while testing, false before going live

/* --- Future Integration Hooks ---
   Placeholders for future print-on-demand providers.
   ----------------------------------------------------------- */
const PRINT_PROVIDER = {
    name: 'lumaprints',          // Future: 'prodigi', 'printful', etc.
    apiEndpoint: null,           // Set when API is ready
    webhookSecret: null          // Set when webhook is configured
};
