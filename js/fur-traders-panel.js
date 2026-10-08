/* ============================================================
   RIVERBEND ART — Montana Fur Traders Consignment Panel
   Injected into the lightbox for priced originals on exhibit at
   Montana Fur Traders Gallery. No on-site checkout — buyers
   contact the gallery directly to purchase.
   ============================================================ */

var FurTradersPanel = (function () {
    'use strict';

    var GALLERY_PHONE = '(406) 871-2927';
    var GALLERY_PHONE_TEL = '+14068712927';
    var GALLERY_EMAIL = 'montanafurtrading@gmail.com';

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
        var altNote = painting.altTitle
            ? '<p class="orig-panel__contact">Displayed at the gallery as &ldquo;' + escapeHTML(painting.altTitle) + '&rdquo;.</p>'
            : '';
        return (
            '<div class="orig-panel" id="furTradersPanel">' +
                '<div class="orig-panel__divider"></div>' +
                '<div class="orig-panel__label">Available at Montana Fur Traders Gallery</div>' +
                '<div class="orig-panel__price-row">' +
                    '<span class="orig-panel__price">$' + painting.price.toFixed(2) + '</span>' +
                    '<span class="orig-panel__note">' + escapeHTML(painting.size) + framedNote + '</span>' +
                '</div>' +
                altNote +
                '<p class="orig-panel__contact">Call <a href="tel:' + GALLERY_PHONE_TEL + '">' + GALLERY_PHONE + '</a> or email <a href="mailto:' + GALLERY_EMAIL + '">' + GALLERY_EMAIL + '</a> to purchase.</p>' +
                '<p class="orig-panel__shipping-note">Martin City, MT &middot; Shipping available on request &mdash; customer pays shipping.</p>' +
            '</div>'
        );
    }

    function show(painting) {
        hide();

        var info = document.querySelector('.lightbox__info');
        if (!info) return;

        var wrapper = document.createElement('div');
        wrapper.innerHTML = buildPanel(painting);
        info.appendChild(wrapper.firstChild);
    }

    function hide() {
        var existing = document.getElementById('furTradersPanel');
        if (existing) existing.remove();
    }

    return { show: show, hide: hide };
})();
