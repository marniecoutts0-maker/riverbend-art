/* ============================================================
   RIVERBEND ART — Analytics
   Loads GA4 + Microsoft Clarity asynchronously.
   Provides reusable event tracking helpers with safe fallbacks.
   ============================================================ */

(function () {
    'use strict';

    if (typeof FEATURES === 'undefined' || !FEATURES.analytics) return;
    if (typeof ANALYTICS_CONFIG === 'undefined') return;

    /* -------------------------------------------------------
       Shared debug logger
       Reads DEBUG_MODE from config.js. Prefix: [Riverbend:Analytics]
       ------------------------------------------------------- */
    function log(eventName, payload) {
        if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
            console.log('[Riverbend:Analytics]', eventName, payload || '');
        }
    }
    /* -------------------------------------------------------
       GA4 — Loader
       Replace ANALYTICS_CONFIG.GA4_MEASUREMENT_ID in config.js
       ------------------------------------------------------- */
    function loadGA4(measurementId) {
        if (!measurementId || measurementId.startsWith('REPLACE')) return;

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', measurementId, { anonymize_ip: true });
    }

    /* -------------------------------------------------------
       Microsoft Clarity — Loader
       Replace ANALYTICS_CONFIG.CLARITY_PROJECT_ID in config.js
       ------------------------------------------------------- */
    function loadClarity(projectId) {
        if (!projectId || projectId.startsWith('REPLACE')) return;

        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', projectId);
    }

    /* -------------------------------------------------------
       Event Tracking Helpers
       Console-safe: silently skips if analytics not loaded.
       ------------------------------------------------------- */

    /** Track a GA4 custom event */
    function trackEvent(eventName, params) {
        try {
            log(eventName, params);
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, params || {});
            }
        } catch (e) { /* analytics blocked or unavailable */ }
    }

    /* -------------------------------------------------------
       Named Event Helpers
       Use these throughout the codebase — never call gtag directly.
       ------------------------------------------------------- */
    window.RiverbendAnalytics = {

        artworkView: function (title, id) {
            trackEvent('artwork_view', { artwork_title: title, artwork_id: id });
        },

        lightboxOpen: function (title, id) {
            trackEvent('lightbox_open', { artwork_title: title, artwork_id: id });
        },

        orderPrintClick: function (title, id) {
            trackEvent('order_print_click', { artwork_title: title, artwork_id: id });
        },

        printSizeSelect: function (size, price) {
            trackEvent('print_size_select', { print_size: size, price: price });
        },

        addToCart: function (title, id, size, price) {
            trackEvent('add_to_cart', {
                artwork_title: title,
                artwork_id: id,
                print_size: size,
                value: price,
                currency: 'USD'
            });
        },

        checkoutClick: function (cartTotal) {
            trackEvent('begin_checkout', { value: cartTotal, currency: 'USD' });
        },

        paypalClick: function (cartTotal) {
            trackEvent('paypal_click', { value: cartTotal, currency: 'USD' });
        },

        outboundClick: function (platform, url) {
            trackEvent('outbound_click', { platform: platform, url: url });
        },

        contactFormSubmit: function () {
            trackEvent('contact_form_submit');
        },

        emailSignupSubmit: function () {
            trackEvent('email_signup_submit');
        }
    };

    /* -------------------------------------------------------
       Auto-wire outbound social links
       ------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('a[href*="instagram.com"]').forEach(function (el) {
            el.addEventListener('click', function () {
                window.RiverbendAnalytics.outboundClick('instagram', el.href);
            });
        });
        document.querySelectorAll('a[href*="facebook.com"]').forEach(function (el) {
            el.addEventListener('click', function () {
                window.RiverbendAnalytics.outboundClick('facebook', el.href);
            });
        });

        /* Contact form submit tracking */
        var contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function () {
                window.RiverbendAnalytics.contactFormSubmit();
            });
        }
    });

    /* --- Init --- */
    loadGA4(ANALYTICS_CONFIG.GA4_MEASUREMENT_ID);
    loadClarity(ANALYTICS_CONFIG.CLARITY_PROJECT_ID);

})();
