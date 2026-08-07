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
    /* Standard black / white */
    { id: '105005', label: '1.25 in. Black',              lumaprintsSubcategoryId: 105005, priceAdj: 0,  widthInches: 1.25,   previewColor: '#1c1c1c', previewStyle: 'solid'          },
    { id: '105006', label: '1.25 in. White',              lumaprintsSubcategoryId: 105006, priceAdj: 0,  widthInches: 1.25,   previewColor: '#f0eeeb', previewStyle: 'solid'          },
    { id: '105009', label: '0.875 in. Black',             lumaprintsSubcategoryId: 105009, priceAdj: 0,  widthInches: 0.875,  previewColor: '#1c1c1c', previewStyle: 'solid'          },
    /* Wood */
    { id: '105022', label: '1.25 in. Maple',              lumaprintsSubcategoryId: 105022, priceAdj: 0,  widthInches: 1.25,   previewColor: '#c49a56', previewStyle: 'wood'           },
    { id: '105007', label: '1.25 in. Oak',                lumaprintsSubcategoryId: 105007, priceAdj: 0,  widthInches: 1.25,   previewColor: '#b8864e', previewStyle: 'wood'           },
    { id: '105024', label: '0.875 in. Maple',             lumaprintsSubcategoryId: 105024, priceAdj: 0,  widthInches: 0.875,  previewColor: '#c49a56', previewStyle: 'wood'           },
    { id: '105003', label: '0.875 in. Oak',               lumaprintsSubcategoryId: 105003, priceAdj: 0,  widthInches: 0.875,  previewColor: '#b8864e', previewStyle: 'wood'           },
    { id: '105008', label: '0.875 in. Natural Wood',      lumaprintsSubcategoryId: 105008, priceAdj: 0,  widthInches: 0.875,  previewColor: '#d4c4a8', previewStyle: 'wood'           },
    /* Espresso / Gold */
    { id: '105012', label: '0.875 in. Espresso',          lumaprintsSubcategoryId: 105012, priceAdj: 0,  widthInches: 0.875,  previewColor: '#231812', previewStyle: 'solid'          },
    { id: '105011', label: '0.875 in. Gold',              lumaprintsSubcategoryId: 105011, priceAdj: 0,  widthInches: 0.875,  previewColor: '#d4a520', previewStyle: 'gold'           },
    /* Matte */
    { id: '105025', label: '1.625 in. Matte Black',       lumaprintsSubcategoryId: 105025, priceAdj: 0,  widthInches: 1.625,  previewColor: '#1c1c1c', previewStyle: 'solid'          },
    { id: '105027', label: '1 in. Matte White',           lumaprintsSubcategoryId: 105027, priceAdj: 0,  widthInches: 1.0,    previewColor: '#f0eeeb', previewStyle: 'solid'          },
    { id: '105028', label: '1 in. Matte Maple',           lumaprintsSubcategoryId: 105028, priceAdj: 0,  widthInches: 1.0,    previewColor: '#c49a56', previewStyle: 'wood'           },
    /* Rustic / Driftwood — priceAdj: 30 */
    { id: '105018', label: '3 in. Driftwood Gray',        lumaprintsSubcategoryId: 105018, priceAdj: 30, widthInches: 3.0,    previewColor: '#8c8882', previewStyle: 'wood'           },
    { id: '105019', label: '3 in. Driftwood White',       lumaprintsSubcategoryId: 105019, priceAdj: 30, widthInches: 3.0,    previewColor: '#e0dcd4', previewStyle: 'wood'           },
    /* Gallery ornate — priceAdj: 30 */
    { id: '105013', label: '2 in. Black with Gold Liner', lumaprintsSubcategoryId: 105013, priceAdj: 30, widthInches: 2.0,    previewColor: '#1c1c1c', previewStyle: 'solid'          },
    /* Plein Air & Copper — priceAdj: 35–45 */
    { id: '105023', label: '3 in. Plein Air Gold',        lumaprintsSubcategoryId: 105023, priceAdj: 35, widthInches: 3.0,    previewColor: '#c49820', previewStyle: 'plein-air-gold' },
    { id: '105020', label: '2.5 in. Plein Air Espresso',  lumaprintsSubcategoryId: 105020, priceAdj: 40, widthInches: 2.5625, previewColor: '#3d2b1f', previewStyle: 'plein-air-gold' },
    { id: '105021', label: '3.25 in. Vintage Copper',     lumaprintsSubcategoryId: 105021, priceAdj: 45, widthInches: 3.25,   previewColor: '#a0724a', previewStyle: 'gold'           }
];

/* --- Print — Mat Sizes ---
   lumaprintsOptionId: verified from live API, August 2026.
   ----------------------------------------------------------- */
const MAT_SIZES = [
    { id: 64, label: 'No Mat',     lumaprintsOptionId: 64, widthInches: 0   },
    { id: 65, label: '1 inch',     lumaprintsOptionId: 65, widthInches: 1   },
    { id: 66, label: '1.5 inches', lumaprintsOptionId: 66, widthInches: 1.5 },
    { id: 67, label: '2 inches',   lumaprintsOptionId: 67, widthInches: 2   },
    { id: 68, label: '2.5 inches', lumaprintsOptionId: 68, widthInches: 2.5 }
];

/* --- Print — Mat Colors ---
   lumaprintsOptionId: verified from live API, August 2026.
   Note: optionId 100 (Raven Black Rag) is absent from live API — excluded.
   ----------------------------------------------------------- */
const MAT_COLORS = [
    { id: 96,  label: 'White',         lumaprintsOptionId: 96,  previewColor: '#f8f8f6' },
    { id: 99,  label: 'Antique White', lumaprintsOptionId: 99,  previewColor: '#f5f0e8' },
    { id: 104, label: 'Off White',     lumaprintsOptionId: 104, previewColor: '#ede8e0' },
    { id: 101, label: 'Dawn Grey',     lumaprintsOptionId: 101, previewColor: '#c8c4bc' },
    { id: 98,  label: 'Smooth Black',  lumaprintsOptionId: 98,  previewColor: '#1a1a1a' }
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

/* --- Room Visualizer Scenes ---
   wallCenterX/Y: center of artwork placement zone in the resized image (px)
   wallMaxWidthPx/HeightPx: maximum artwork footprint (px) — art is clamped to this
   wallRealWidthIn: real-world inches that wallMaxWidthPx represents (sets scale)
   ----------------------------------------------------------- */
const ROOM_SCENES = [
    {
        id:              'gallery-wall',
        label:           'Gallery',
        thumb:           'images/Room Visualizer/gallery-wall-thumb.jpg',
        img:             'images/Room Visualizer/gallery-wall.jpg',
        imgWidth:        800,  imgHeight:       543,
        wallCenterX:     400,  wallCenterY:     210,
        wallMaxWidthPx:  640,  wallMaxHeightPx: 330,
        wallRealWidthIn: 108
    },
    {
        id:              'warm-living',
        label:           'Living Room',
        thumb:           'images/Room Visualizer/warm-living-thumb.jpg',
        img:             'images/Room Visualizer/warm-living.jpg',
        imgWidth:        800,  imgHeight:       532,
        wallCenterX:     395,  wallCenterY:     185,
        wallMaxWidthPx:  400,  wallMaxHeightPx: 210,
        wallRealWidthIn: 84
    },
    {
        id:              'warm-living-2',
        label:           'Living Room 2',
        thumb:           'images/Room Visualizer/warm-living-2-thumb.jpg',
        img:             'images/Room Visualizer/warm-living-2.jpg',
        imgWidth:        800,  imgHeight:       532,
        wallCenterX:     400,  wallCenterY:     178,
        wallMaxWidthPx:  420,  wallMaxHeightPx: 215,
        wallRealWidthIn: 84
    },
    {
        id:              'modern-neutral',
        label:           'Modern',
        thumb:           'images/Room Visualizer/modern-neutral-thumb.jpg',
        img:             'images/Room Visualizer/modern-neutral.jpg',
        imgWidth:        800,  imgHeight:       543,
        wallCenterX:     400,  wallCenterY:     195,
        wallMaxWidthPx:  450,  wallMaxHeightPx: 255,
        wallRealWidthIn: 84
    },
    {
        id:              'bedroom',
        label:           'Bedroom',
        thumb:           'images/Room Visualizer/bedroom-thumb.jpg',
        img:             'images/Room Visualizer/bedroom.jpg',
        imgWidth:        800,  imgHeight:       800,
        wallCenterX:     400,  wallCenterY:     200,
        wallMaxWidthPx:  380,  wallMaxHeightPx: 240,
        wallRealWidthIn: 72
    },
    {
        id:              'home-office',
        label:           'Office',
        thumb:           'images/Room Visualizer/home-office-thumb.jpg',
        img:             'images/Room Visualizer/home-office.jpg',
        imgWidth:        800,  imgHeight:       800,
        wallCenterX:     415,  wallCenterY:     235,
        wallMaxWidthPx:  490,  wallMaxHeightPx: 370,
        wallRealWidthIn: 84
    }
];
