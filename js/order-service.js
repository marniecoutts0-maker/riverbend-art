/* ============================================================
   RIVERBEND ART — Order Service
   Builds a structured order object. All cart-to-checkout
   flow passes through here, making future integrations easy.
   ============================================================ */

var OrderService = (function () {
    'use strict';

    /* -------------------------------------------------------
       Shared debug logger
       Reads DEBUG_MODE from config.js. Prefix: [Riverbend:Order]
       ------------------------------------------------------- */
    function log(label, data) {
        if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
            console.log('[Riverbend:Order]', label, data !== undefined ? data : '');
        }
    }

    /* -------------------------------------------------------
       buildOrder()
       Returns a plain order object for PayPal, logging, email.
       ------------------------------------------------------- */
    function buildOrder(item) {
        var order = {
            artworkTitle:      item.artworkTitle      || '',
            artworkId:         item.artworkId         || '',
            printSize:         item.printSize         || '',
            printSizeLabel:    item.printSizeLabel     || '',
            quantity:          item.quantity           || 1,
            unitPrice:         item.unitPrice          || 0,
            subtotal:          (item.unitPrice || 0) * (item.quantity || 1),
            currency:          'USD',
            buyerNote:         item.buyerNote          || '',
            timestamp:         new Date().toISOString(),
            source:            'riverbend-art-web',
            /* Populated after PayPal capture: */
            paypalOrderId:     null,
            paypalStatus:      null,
            /* Future hooks (leave null until integrations are live): */
            lumaprintsJobId:   null,    // Lumaprintss or other POD provider job ID
            emailSent:         false    // Set true after confirmation email sent
        };
        log('buildOrder', order);
        return order;
    }

    /* -------------------------------------------------------
       buildPayPalItems()
       Formats cart items for the PayPal JS SDK purchase_units.
       ------------------------------------------------------- */
    function buildPayPalItems(cartItems) {
        return cartItems.map(function (item) {
            return {
                name: item.artworkTitle + ' (' + item.printSizeLabel + ')',
                unit_amount: {
                    currency_code: 'USD',
                    value: item.unitPrice.toFixed(2)
                },
                quantity: String(item.quantity)
            };
        });
    }

    /* -------------------------------------------------------
       buildPayPalPurchaseUnit()
       Returns a PayPal purchase_units entry with line items + total.
       ------------------------------------------------------- */
    function buildPayPalPurchaseUnit(cartItems) {
        var total = cartItems.reduce(function (sum, item) {
            return sum + item.unitPrice * item.quantity;
        }, 0);

        return {
            description: 'Fine Art Prints — Riverbend Art',
            amount: {
                currency_code: 'USD',
                value: total.toFixed(2),
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: total.toFixed(2)
                    }
                }
            },
            items: buildPayPalItems(cartItems)
        };
    }

    /* -------------------------------------------------------
       Future: sendOrderToBackend()
       Uncomment and implement when a backend is available.
       ------------------------------------------------------- */
    // function sendOrderToBackend(order) {
    //     return fetch('/api/orders', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(order)
    //     }).then(function (r) { return r.json(); });
    // }

    /* -------------------------------------------------------
       Future: triggerPrintJob()
       Calls print-on-demand provider when order is captured.
       ------------------------------------------------------- */
    // function triggerPrintJob(order) {
    //     // Lumaprints, Prodigi, Printful etc.
    //     if (typeof PRINT_PROVIDER === 'undefined' || !PRINT_PROVIDER.apiEndpoint) return;
    //     return fetch(PRINT_PROVIDER.apiEndpoint, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': 'Bearer ' + PRINT_PROVIDER.apiKey
    //         },
    //         body: JSON.stringify(order)
    //     });
    // }

    return {
        buildOrder:                buildOrder,
        buildPayPalItems:          buildPayPalItems,
        buildPayPalPurchaseUnit:   buildPayPalPurchaseUnit
    };

})();
