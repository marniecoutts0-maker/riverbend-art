/* ============================================================
   RIVERBEND ART — Cart
   localStorage-backed cart state + slide-in drawer UI.
   Works independently of the lightbox / print-order panel.
   ============================================================ */

var Cart = (function () {
    'use strict';

    var STORAGE_KEY = 'riverbend_cart';
    var drawerEl = null;
    var overlayEl = null;
    var badgeEl = null;

    /* -------------------------------------------------------
       Shared debug logger
       Reads DEBUG_MODE from config.js. Prefix: [Riverbend:Cart]
       ------------------------------------------------------- */
    function log(label, data) {
        if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
            console.log('[Riverbend:Cart]', label, data !== undefined ? data : '');
        }
    }
    /* -------------------------------------------------------
       State helpers (localStorage)
       ------------------------------------------------------- */
    function getItems() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) { /* storage unavailable */ }
    }

    /** Unique key per artwork + size combination */
    function itemKey(artworkId, printSize) {
        return artworkId + '__' + printSize;
    }

    /* -------------------------------------------------------
       Public cart API
       ------------------------------------------------------- */
    function addItem(item) {
        var items = getItems();
        var key = itemKey(item.artworkId, item.printSize);
        var existing = items.find(function (i) { return itemKey(i.artworkId, i.printSize) === key; });

        if (existing) {
            existing.quantity = Math.min((existing.quantity || 1) + (item.quantity || 1), 9);
            log('qty increased', { id: item.artworkId, size: item.printSize, qty: existing.quantity });
        } else {
            items.push({
                artworkTitle:   item.artworkTitle,
                artworkId:      item.artworkId,
                artworkImage:   item.artworkImage || '',
                printSize:      item.printSize,
                printSizeLabel: item.printSizeLabel,
                unitPrice:      item.unitPrice,
                quantity:       item.quantity || 1
            });
            log('item added', { id: item.artworkId, size: item.printSize, price: item.unitPrice });
        }
        saveItems(items);
        refreshBadge();
        refreshDrawer();

        if (window.RiverbendAnalytics) {
            window.RiverbendAnalytics.addToCart(item.artworkTitle, item.artworkId, item.printSize, item.unitPrice);
        }
    }

    function removeItem(artworkId, printSize) {
        log('item removed', { id: artworkId, size: printSize });
        var items = getItems().filter(function (i) {
            return itemKey(i.artworkId, i.printSize) !== itemKey(artworkId, printSize);
        });
        saveItems(items);
        refreshBadge();
        refreshDrawer();
    }

    function updateQty(artworkId, printSize, qty) {
        var items = getItems();
        var key = itemKey(artworkId, printSize);
        var item = items.find(function (i) { return itemKey(i.artworkId, i.printSize) === key; });
        if (item) {
            item.quantity = Math.max(1, Math.min(9, parseInt(qty, 10) || 1));
            log('qty updated', { id: artworkId, size: printSize, qty: item.quantity });
        }
        saveItems(items);
        refreshBadge();
        refreshDrawer();
    }

    function clearCart() {
        log('cart cleared', null);
        saveItems([]);
        refreshBadge();
        refreshDrawer();
    }

    function getTotal() {
        return getItems().reduce(function (sum, i) { return sum + i.unitPrice * i.quantity; }, 0);
    }

    function getCount() {
        return getItems().reduce(function (sum, i) { return sum + i.quantity; }, 0);
    }

    /* -------------------------------------------------------
       Badge — cart count on nav icon
       ------------------------------------------------------- */
    function refreshBadge() {
        if (!badgeEl) badgeEl = document.getElementById('cartBadge');
        if (!badgeEl) return;
        var count = getCount();
        badgeEl.textContent = count;
        badgeEl.style.display = count > 0 ? 'flex' : 'none';
    }

    /* -------------------------------------------------------
       Drawer — slide-in panel
       ------------------------------------------------------- */
    function renderLineItems(items) {
        if (items.length === 0) {
            return '<p class="cart__empty">Your cart is empty.</p>';
        }
        return items.map(function (item) {
            var key = itemKey(item.artworkId, item.printSize);
            return (
                '<div class="cart__line" data-key="' + key + '">' +
                    (item.artworkImage
                        ? '<img class="cart__line-img" src="' + item.artworkImage + '" alt="' + item.artworkTitle + '">'
                        : '') +
                    '<div class="cart__line-details">' +
                        '<div class="cart__line-title">' + item.artworkTitle + '</div>' +
                        '<div class="cart__line-meta">' + item.printSizeLabel + ' Fine Art Print</div>' +
                        '<div class="cart__line-price">$' + item.unitPrice.toFixed(2) + '</div>' +
                    '</div>' +
                    '<div class="cart__line-controls">' +
                        '<select class="cart__qty-select" aria-label="Quantity" ' +
                                'data-artwork-id="' + item.artworkId + '" ' +
                                'data-print-size="' + item.printSize + '">' +
                            [1,2,3,4,5,6,7,8,9].map(function (n) {
                                return '<option value="' + n + '"' + (n === item.quantity ? ' selected' : '') + '>' + n + '</option>';
                            }).join('') +
                        '</select>' +
                        '<button class="cart__remove" ' +
                                'data-artwork-id="' + item.artworkId + '" ' +
                                'data-print-size="' + item.printSize + '" ' +
                                'aria-label="Remove">&times;</button>' +
                    '</div>' +
                '</div>'
            );
        }).join('');
    }

    function refreshDrawer() {
        if (!drawerEl) drawerEl = document.getElementById('cartDrawer');
        if (!drawerEl) return;

        var items = getItems();
        var total = getTotal();
        var bodyEl = drawerEl.querySelector('.cart__body');
        var footerEl = drawerEl.querySelector('.cart__footer');

        if (bodyEl) bodyEl.innerHTML = renderLineItems(items);
        if (footerEl) {
            footerEl.style.display = items.length > 0 ? 'block' : 'none';
            var totalEl = footerEl.querySelector('.cart__total-value');
            if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
        }

        /* Bind remove + qty events */
        if (bodyEl) {
            bodyEl.querySelectorAll('.cart__remove').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    removeItem(btn.getAttribute('data-artwork-id'), btn.getAttribute('data-print-size'));
                });
            });
            bodyEl.querySelectorAll('.cart__qty-select').forEach(function (sel) {
                sel.addEventListener('change', function () {
                    updateQty(sel.getAttribute('data-artwork-id'), sel.getAttribute('data-print-size'), sel.value);
                });
            });
        }
    }

    /* -------------------------------------------------------
       Drawer open / close
       ------------------------------------------------------- */
    function openDrawer() {
        if (!drawerEl) return;
        refreshDrawer();
        drawerEl.classList.add('cart__drawer--open');
        if (overlayEl) overlayEl.classList.add('cart__overlay--visible');
        document.body.classList.add('cart-open');
    }

    function closeDrawer() {
        if (!drawerEl) return;
        drawerEl.classList.remove('cart__drawer--open');
        if (overlayEl) overlayEl.classList.remove('cart__overlay--visible');
        document.body.classList.remove('cart-open');
    }

    /* -------------------------------------------------------
       Inject drawer HTML into page
       ------------------------------------------------------- */
    function injectDrawer() {
        if (document.getElementById('cartDrawer')) return; /* already present */

        /* Overlay */
        overlayEl = document.createElement('div');
        overlayEl.id = 'cartOverlay';
        overlayEl.className = 'cart__overlay';
        overlayEl.addEventListener('click', closeDrawer);
        document.body.appendChild(overlayEl);

        /* Drawer */
        drawerEl = document.createElement('div');
        drawerEl.id = 'cartDrawer';
        drawerEl.className = 'cart__drawer';
        drawerEl.setAttribute('aria-label', 'Shopping cart');
        drawerEl.innerHTML =
            '<div class="cart__header">' +
                '<h2 class="cart__heading">Your Cart</h2>' +
                '<button class="cart__close" aria-label="Close cart">&times;</button>' +
            '</div>' +
            '<div class="cart__body"></div>' +
            '<div class="cart__footer">' +
                '<div class="cart__total">' +
                    '<span class="cart__total-label">Total</span>' +
                    '<span class="cart__total-value">$0.00</span>' +
                '</div>' +
                '<p class="cart__shipping-note">Shipping included · Continental US</p>' +
                '<div id="paypalButtonContainer" class="cart__paypal-container"></div>' +
            '</div>';
        document.body.appendChild(drawerEl);

        drawerEl.querySelector('.cart__close').addEventListener('click', closeDrawer);

        /* Keyboard trap: close on Escape */
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawerEl.classList.contains('cart__drawer--open')) {
                closeDrawer();
            }
        });

        refreshBadge();
        refreshDrawer();
        initPayPal();
    }

    /* -------------------------------------------------------
       PayPal JS SDK
       Loaded on-demand when drawer is first injected.
       ------------------------------------------------------- */
    function initPayPal() {
        if (typeof PAYPAL_CONFIG === 'undefined') return;

        var isSandbox = PAYPAL_CONFIG.PAYPAL_SANDBOX_MODE === true;
        var clientId  = isSandbox ? PAYPAL_CONFIG.SANDBOX_CLIENT_ID : PAYPAL_CONFIG.CLIENT_ID;

        if (!clientId || clientId.startsWith('REPLACE')) {
            console.info(
                'Riverbend Art: Add your PayPal ' + (isSandbox ? 'Sandbox' : 'Live') +
                ' Client ID to js/config.js to enable checkout.'
            );
            return;
        }

        if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
            console.log('[Riverbend:PayPal] Loading SDK —', isSandbox ? 'SANDBOX mode' : 'LIVE mode');
        }

        var script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?' +
            'client-id=' + clientId +
            '&currency=' + PAYPAL_CONFIG.CURRENCY +
            '&intent='   + PAYPAL_CONFIG.INTENT +
            (isSandbox ? '&buyer-country=US' : '');
        script.onload = function () { renderPayPalButton(); };
        document.head.appendChild(script);
    }

    function renderPayPalButton() {
        var container = document.getElementById('paypalButtonContainer');
        if (!container || typeof paypal === 'undefined') return;
        if (container.dataset.rendered) return;
        container.dataset.rendered = 'true';

        paypal.Buttons({
            style: {
                layout: 'vertical',
                color:  'gold',
                shape:  'rect',
                label:  'pay'
            },
            createOrder: function (data, actions) {
                var items = getItems();
                if (window.RiverbendAnalytics) {
                    window.RiverbendAnalytics.paypalClick(getTotal());
                }
                var purchaseUnit = OrderService.buildPayPalPurchaseUnit(items);
                if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
                    console.log('[Riverbend:PayPal] createOrder — purchase_units:', purchaseUnit);
                }
                return actions.order.create({ purchase_units: [purchaseUnit] });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
                        console.log('[Riverbend:PayPal] onApprove — capture details:', details);
                    }
                    var buyerName = details.payer && details.payer.name
                        ? details.payer.name.given_name
                        : 'there';
                    clearCart();
                    closeDrawer();
                    showOrderConfirmation(buyerName, details.id);
                });
            },
            onError: function (err) {
                console.error('[Riverbend:PayPal] Error:', err);
            }
        }).render('#paypalButtonContainer');
    }

    /* -------------------------------------------------------
       Order confirmation notice (non-intrusive)
       ------------------------------------------------------- */
    function showOrderConfirmation(buyerName, orderId) {
        var notice = document.createElement('div');
        notice.className = 'cart__confirmation';
        notice.innerHTML =
            '<div class="cart__confirmation-inner">' +
                '<p class="cart__confirmation-title">Thank you, ' + buyerName + '.</p>' +
                '<p class="cart__confirmation-text">Your print order has been received. ' +
                    'You\'ll receive a confirmation email shortly.</p>' +
                '<p class="cart__confirmation-ref">Order ref: ' + orderId + '</p>' +
                '<button class="cart__confirmation-close">Close</button>' +
            '</div>';
        document.body.appendChild(notice);

        notice.querySelector('.cart__confirmation-close').addEventListener('click', function () {
            notice.remove();
        });

        setTimeout(function () { if (notice.parentNode) notice.remove(); }, 8000);
    }

    /* -------------------------------------------------------
       Init — called from DOMContentLoaded in gallery.html
       ------------------------------------------------------- */
    function init() {
        if (typeof FEATURES === 'undefined' || !FEATURES.cart) return;
        injectDrawer();

        /* Cart icon in nav */
        var cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', openDrawer);
        }
    }

    return {
        init:       init,
        addItem:    addItem,
        removeItem: removeItem,
        updateQty:  updateQty,
        clearCart:  clearCart,
        getItems:   getItems,
        getTotal:   getTotal,
        getCount:   getCount,
        openDrawer: openDrawer,
        closeDrawer:closeDrawer
    };

})();
