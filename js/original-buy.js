/* ============================================================
   RIVERBEND ART — Original Painting Buy Panel
   Injected into the lightbox for priced available originals.
   Handles direct PayPal checkout for one-of-a-kind works.
   ============================================================ */

var OriginalBuy = (function () {
    'use strict';

    var currentPainting = null;

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildPanel(painting) {
        var framedNote = painting.framed ? ' &nbsp;&middot;&nbsp; Framed' : ' &nbsp;&middot;&nbsp; Unframed';
        return (
            '<div class="orig-panel" id="origPanel">' +
                '<div class="orig-panel__divider"></div>' +
                '<div class="orig-panel__label">Original Painting</div>' +
                '<div class="orig-panel__price-row">' +
                    '<span class="orig-panel__price">$' + painting.price.toFixed(2) + '</span>' +
                    '<span class="orig-panel__note">' + escapeHTML(painting.size) + framedNote + '</span>' +
                '</div>' +
                '<div id="origPaypalContainer" class="orig-panel__paypal-container"></div>' +
                '<p class="orig-panel__shipping-note">Free shipping &middot; Continental US</p>' +
            '</div>'
        );
    }

    function injectPanel(painting) {
        removePanel();
        currentPainting = painting;

        var info = document.querySelector('.lightbox__info');
        if (!info) return;

        var wrapper = document.createElement('div');
        wrapper.innerHTML = buildPanel(painting);
        info.appendChild(wrapper.firstChild);

        loadAndRenderPayPal(painting);
    }

    function removePanel() {
        var existing = document.getElementById('origPanel');
        if (existing) existing.remove();
        currentPainting = null;
    }

    function loadAndRenderPayPal(painting) {
        /* Already loaded */
        if (typeof paypal !== 'undefined') {
            renderButton(painting);
            return;
        }

        /* SDK script is in the DOM but not yet executed — poll for it */
        if (document.querySelector('script[src*="paypal.com/sdk"]')) {
            var attempts = 0;
            var poll = setInterval(function () {
                attempts++;
                if (typeof paypal !== 'undefined') {
                    clearInterval(poll);
                    if (currentPainting) renderButton(currentPainting);
                } else if (attempts > 50) {
                    clearInterval(poll); /* give up after ~5s */
                }
            }, 100);
            return;
        }

        /* Need to load the SDK ourselves */
        if (typeof PAYPAL_CONFIG === 'undefined') return;

        var isSandbox = PAYPAL_CONFIG.PAYPAL_SANDBOX_MODE === true;
        var clientId = isSandbox ? PAYPAL_CONFIG.SANDBOX_CLIENT_ID : PAYPAL_CONFIG.CLIENT_ID;
        if (!clientId) return;

        var script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?' +
            'client-id=' + encodeURIComponent(clientId) +
            '&currency=' + encodeURIComponent(PAYPAL_CONFIG.CURRENCY) +
            '&intent=' + encodeURIComponent(PAYPAL_CONFIG.INTENT);
        script.onload = function () {
            if (currentPainting) renderButton(currentPainting);
        };
        document.head.appendChild(script);
    }

    function renderButton(painting) {
        var container = document.getElementById('origPaypalContainer');
        if (!container || typeof paypal === 'undefined') return;

        paypal.Buttons({
            style: {
                layout: 'vertical',
                color:  'gold',
                shape:  'rect',
                label:  'buynow',
                height: 40
            },
            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        description: 'Original Painting \u2014 ' + painting.title + ' \u2014 Riverbend Art',
                        amount: {
                            currency_code: 'USD',
                            value: painting.price.toFixed(2)
                        },
                        custom_id: painting.id
                    }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    var buyerName = details.payer && details.payer.name
                        ? details.payer.name.given_name : 'there';

                    if (window.RiverbendAnalytics) {
                        window.RiverbendAnalytics.purchase(details.id, painting.price, [{
                            artworkTitle:   painting.title,
                            artworkId:      painting.id,
                            printSize:      'original',
                            printSizeLabel: 'Original',
                            unitPrice:      painting.price,
                            quantity:       1
                        }]);
                    }

                    showConfirmation(buyerName, painting.title);
                });
            },
            onError: function (err) {
                console.error('[Riverbend:OriginalBuy] PayPal error:', err);
            }
        }).render('#origPaypalContainer');
    }

    function showConfirmation(buyerName, title) {
        var panel = document.getElementById('origPanel');
        if (!panel) return;
        panel.innerHTML =
            '<div class="orig-panel__confirmation">' +
                '<p class="orig-panel__conf-title">Thank you, ' + escapeHTML(buyerName) + '!</p>' +
                '<p class="orig-panel__conf-text">Your purchase of <em>' + escapeHTML(title) + '</em> is confirmed. ' +
                    'We\u2019ll be in touch shortly about shipping.</p>' +
            '</div>';
    }

    function show(painting) { injectPanel(painting); }
    function hide() { removePanel(); }

    return { show: show, hide: hide };

})();
