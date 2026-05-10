/* ============================================================
   RIVERBEND ART — Print Order Panel
   Injected into the existing lightbox for print-available works.
   Handles size/qty selection, dynamic pricing, and cart add.
   ============================================================ */

var PrintOrder = (function () {
    'use strict';

    var currentPainting = null;

    /* -------------------------------------------------------
       Status / availability label helpers
       ------------------------------------------------------- */

    /**
     * Returns the print availability label appropriate to the
     * painting's original status.
     *
     * - status "available":          "Original inquiry available · Fine Art Prints Available."
     * - status "private-collection": "Original in Private Collection · Fine Art Prints Available."
     * - anything else:               "Fine Art Prints Available."
     */
    function printAvailabilityLabel(status) {
        if (status === 'available') {
            return 'Original inquiry available · Fine Art Prints Available.';
        }
        if (status === 'private-collection') {
            return 'Original in Private Collection · Fine Art Prints Available.';
        }
        return 'Fine Art Prints Available.';
    }

    /* -------------------------------------------------------
       Build the print panel HTML
       ------------------------------------------------------- */
    function buildPanel(painting) {
        var defaultOption = PRINT_OPTIONS[0];
        var optionsHTML = PRINT_OPTIONS.map(function (opt, i) {
            return '<option value="' + i + '">' +
                opt.label + ' — $' + opt.price.toFixed(2) +
            '</option>';
        }).join('');

        return (
            '<div class="print-panel" id="printPanel">' +
                '<div class="print-panel__label">Fine Art Print</div>' +
                '<div class="print-panel__availability">' +
                    printAvailabilityLabel(painting.status) +
                '</div>' +
                '<div class="print-panel__field">' +
                    '<label class="print-panel__field-label" for="printSizeSelect">Print Size</label>' +
                    '<select class="form__select print-panel__select" id="printSizeSelect" aria-label="Select print size">' +
                        optionsHTML +
                    '</select>' +
                '</div>' +
                '<div class="print-panel__field">' +
                    '<label class="print-panel__field-label" for="printQty">Quantity</label>' +
                    '<select class="form__select print-panel__select" id="printQty" aria-label="Select quantity">' +
                        [1,2,3,4,5].map(function (n) {
                            return '<option value="' + n + '">' + n + '</option>';
                        }).join('') +
                    '</select>' +
                '</div>' +
                '<div class="print-panel__price-row">' +
                    '<span class="print-panel__price-label">Price</span>' +
                    '<span class="print-panel__price" id="printPriceDisplay">$' + defaultOption.price.toFixed(2) + '</span>' +
                '</div>' +
                '<p class="print-panel__shipping-note">Shipping included · Continental US</p>' +
                '<button class="print-panel__add-btn" id="printAddToCart">Add to Cart</button>' +
            '</div>'
        );
    }

    /* -------------------------------------------------------
       Inject / update / remove panel in lightbox info column
       ------------------------------------------------------- */
    function injectPanel(painting) {
        removePanel();
        currentPainting = painting;

        var info = document.querySelector('.lightbox__info');
        if (!info) return;

        var panelWrapper = document.createElement('div');
        panelWrapper.innerHTML = buildPanel(painting);
        var panel = panelWrapper.firstChild;
        info.appendChild(panel);

        bindPanelEvents(painting, panel);
    }

    function removePanel() {
        var existing = document.getElementById('printPanel');
        if (existing) existing.remove();
        currentPainting = null;
    }

    /* -------------------------------------------------------
       Panel event bindings
       ------------------------------------------------------- */
    function bindPanelEvents(painting, panel) {
        var sizeSelect  = panel.querySelector('#printSizeSelect');
        var qtySelect   = panel.querySelector('#printQty');
        var priceDisplay = panel.querySelector('#printPriceDisplay');
        var addBtn      = panel.querySelector('#printAddToCart');

        function getSelectedOption() {
            return PRINT_OPTIONS[parseInt(sizeSelect.value, 10)] || PRINT_OPTIONS[0];
        }

        function updatePrice() {
            var opt = getSelectedOption();
            var qty = parseInt(qtySelect.value, 10) || 1;
            priceDisplay.textContent = '$' + (opt.price * qty).toFixed(2);

            if (window.RiverbendAnalytics) {
                window.RiverbendAnalytics.printSizeSelect(opt.size, opt.price);
            }
        }

        sizeSelect.addEventListener('change', updatePrice);
        qtySelect.addEventListener('change', updatePrice);

        addBtn.addEventListener('click', function () {
            var opt = getSelectedOption();
            var qty = parseInt(qtySelect.value, 10) || 1;

            Cart.addItem({
                artworkTitle:   painting.title,
                artworkId:      painting.id,
                artworkImage:   painting.image,
                printSize:      opt.size,
                printSizeLabel: opt.label,
                unitPrice:      opt.price,
                quantity:       qty
            });

            /* Visual feedback */
            addBtn.textContent = 'Added to Cart ✓';
            addBtn.disabled = true;
            addBtn.classList.add('print-panel__add-btn--added');
            setTimeout(function () {
                addBtn.textContent = 'Add to Cart';
                addBtn.disabled = false;
                addBtn.classList.remove('print-panel__add-btn--added');
            }, 2000);

            Cart.openDrawer();

            if (window.RiverbendAnalytics) {
                window.RiverbendAnalytics.orderPrintClick(painting.title, painting.id);
            }
        });
    }

    /* -------------------------------------------------------
       Public API — called from main.js lightbox open handler
       ------------------------------------------------------- */
    function show(painting) {
        injectPanel(painting);
    }

    function hide() {
        removePanel();
    }

    return { show: show, hide: hide };

})();
