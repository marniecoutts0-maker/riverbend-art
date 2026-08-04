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
    GA4_MEASUREMENT_ID: 'G-K8RTW72G5V',
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

/* --- Print — Available Media ---
   ----------------------------------------------------------- */
const PRINT_MEDIA = [
    { id: 'fine-art-paper',        label: 'Fine Art Print',        lumaprintsCategory: 103 },
    { id: 'framed-fine-art-paper', label: 'Framed Fine Art Print', lumaprintsCategory: 105 },
    { id: 'canvas',                label: 'Gallery Canvas',        lumaprintsCategory: 101 }
];

/* --- Print — Available Sizes per Medium ---
   Canvas starts at 11×14 (8×10 canvas looks awkward at gallery wrap depth).
   ----------------------------------------------------------- */
const PRINT_SIZES = {
    'fine-art-paper': [
        { id: '8x10',  label: '8 × 10 in.',  width: 8,  height: 10 },
        { id: '11x14', label: '11 × 14 in.', width: 11, height: 14 },
        { id: '16x20', label: '16 × 20 in.', width: 16, height: 20 }
    ],
    'framed-fine-art-paper': [
        { id: '8x10',  label: '8 × 10 in.',  width: 8,  height: 10 },
        { id: '11x14', label: '11 × 14 in.', width: 11, height: 14 },
        { id: '16x20', label: '16 × 20 in.', width: 16, height: 20 }
    ],
    'canvas': [
        { id: '11x14', label: '11 × 14 in.', width: 11, height: 14 },
        { id: '16x20', label: '16 × 20 in.', width: 16, height: 20 },
        { id: '18x24', label: '18 × 24 in.', width: 18, height: 24 },
        { id: '24x30', label: '24 × 30 in.', width: 24, height: 30 }
    ]
};

/* --- Print — Paper Types (Fine Art Paper, unframed) ---
   lumaprintsSubcategoryId: verified from live API, August 2026.
   priceAdj: added to base price for premium-weight papers.
   ----------------------------------------------------------- */
const PAPER_TYPES = [
    { id: 'archival',   label: 'Archival Smooth Matte', lumaprintsSubcategoryId: 103001, priceAdj: 0  },
    { id: 'hot-press',  label: 'Hot Press Matte',       lumaprintsSubcategoryId: 103002, priceAdj: 10 },
    { id: 'cold-press', label: 'Cold Press Textured',   lumaprintsSubcategoryId: 103003, priceAdj: 10 },
    { id: 'semi-gloss', label: 'Semi-Gloss',            lumaprintsSubcategoryId: 103005, priceAdj: 0  }
];

/* --- Print — Frame Options (Framed Fine Art Paper) ---
   Each frame style is a distinct Lumaprints subcategory.
   lumaprintsSubcategoryId: verified from live API, August 2026.
   26 frame styles exist; curated to gallery-appropriate options below.
   ----------------------------------------------------------- */
const FRAME_OPTIONS = [
    { id: '105005', label: '1.25 in. Black',       lumaprintsSubcategoryId: 105005 },
    { id: '105006', label: '1.25 in. White',       lumaprintsSubcategoryId: 105006 },
    { id: '105022', label: '1.25 in. Maple Wood',  lumaprintsSubcategoryId: 105022 },
    { id: '105009', label: '0.875 in. Black',      lumaprintsSubcategoryId: 105009 },
    { id: '105011', label: '0.875 in. Gold',       lumaprintsSubcategoryId: 105011 },
    { id: '105023', label: '3 in. Gold Plein Air', lumaprintsSubcategoryId: 105023 }
];

/* --- Print — Mat Sizes ---
   lumaprintsOptionId: verified from live API, August 2026.
   ----------------------------------------------------------- */
const MAT_SIZES = [
    { id: 64, label: 'No Mat',     lumaprintsOptionId: 64 },
    { id: 65, label: '1 inch',     lumaprintsOptionId: 65 },
    { id: 66, label: '1.5 inches', lumaprintsOptionId: 66 },
    { id: 67, label: '2 inches',   lumaprintsOptionId: 67 },
    { id: 68, label: '2.5 inches', lumaprintsOptionId: 68 }
];

/* --- Print — Mat Colors ---
   lumaprintsOptionId: verified from live API, August 2026.
   Note: optionId 100 (Raven Black Rag) is absent from live API — excluded.
   ----------------------------------------------------------- */
const MAT_COLORS = [
    { id: 96,  label: 'White',         lumaprintsOptionId: 96  },
    { id: 99,  label: 'Antique White', lumaprintsOptionId: 99  },
    { id: 104, label: 'Off White',     lumaprintsOptionId: 104 },
    { id: 101, label: 'Dawn Grey',     lumaprintsOptionId: 101 },
    { id: 98,  label: 'Smooth Black',  lumaprintsOptionId: 98  }
];

/* --- Print — Canvas Border Options ---
   lumaprintsOptionId: verified from live API, August 2026.
   ----------------------------------------------------------- */
const CANVAS_BORDERS = [
    { id: 1, label: 'Image Wrap',  lumaprintsOptionId: 1 },
    { id: 2, label: 'Mirror Wrap', lumaprintsOptionId: 2 }
];

/* --- Print — Retail Prices (shipping included, continental US) ---
   Fine Art Paper: base price applies to Archival and Semi-Gloss.
                   hotPressAdj is added for Hot Press and Cold Press.
   Framed / Canvas: single price per size regardless of frame or mat choice.
   Edit these values to adjust your retail margins.
   ----------------------------------------------------------- */
const PRINT_PRICES = {
    'fine-art-paper': {
        '8x10':  { base: 45,  hotPressAdj: 10 },
        '11x14': { base: 70,  hotPressAdj: 15 },
        '16x20': { base: 120, hotPressAdj: 25 }
    },
    'framed-fine-art-paper': {
        '8x10':  95,
        '11x14': 130,
        '16x20': 165
    },
    'canvas': {
        '11x14': 95,
        '16x20': 130,
        '18x24': 155,
        '24x30': 195
    }
};

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

/* --- Lumaprints Account ---
   storeId: verified from live production API, August 2026.
   apiEndpoint: set when server-side automation is built (Vercel function).
   ----------------------------------------------------------- */
const PRINT_PROVIDER = {
    name:        'lumaprints',
    storeId:     91657,
    apiEndpoint: null
};
