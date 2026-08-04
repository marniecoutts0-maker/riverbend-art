/* ============================================================
   RIVERBEND ART — Print Order Panel
   Injected into the existing lightbox for print-available works.
   Handles medium / size / options selection, dynamic pricing, and cart add.
   ============================================================ */

var PrintOrder = (function () {
    'use strict';

    var currentPainting = null;

    /* -------------------------------------------------------
       Panel state — mirrors current dropdown selections
       ------------------------------------------------------- */
    var state = {
        medium:       'fine-art-paper',
        sizeId:       '8x10',
        paperType:    'archival',
        frameId:      '105005',
        matSizeId:    64,
        matColorId:   96,
        canvasBorder: 1,
        qty:          1
    };

    /* -------------------------------------------------------
       Availability label helpers
       ------------------------------------------------------- */
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
       Price calculation from current state
       ------------------------------------------------------- */
    function calculatePrice() {
        var prices = PRINT_PRICES[state.medium];
        if (!prices) return 0;
        var sizePrice = prices[state.sizeId];
        if (sizePrice === undefined || sizePrice === null) return 0;

        if (state.medium === 'fine-art-paper') {
            var adj = (state.paperType === 'hot-press' || state.paperType === 'cold-press')
                ? sizePrice.hotPressAdj : 0;
            return (sizePrice.base + adj) * state.qty;
        }
        return sizePrice * state.qty;
    }

    /* -------------------------------------------------------
       Config key — unique cart identifier for this artwork + config
       ------------------------------------------------------- */
    function buildConfigKey() {
        if (state.medium === 'fine-art-paper') {
            return state.sizeId + '__fap__' + state.paperType;
        }
        if (state.medium === 'framed-fine-art-paper') {
            return state.sizeId + '__framed__' + state.frameId + '__' + state.matSizeId + '__' + state.matColorId;
        }
        if (state.medium === 'canvas') {
            return state.sizeId + '__canvas__' + state.canvasBorder;
        }
        return state.sizeId;
    }

    /* -------------------------------------------------------
       Config label — human-readable description for cart + PayPal
       ------------------------------------------------------- */
    function buildConfigLabel() {
        var sizes   = PRINT_SIZES[state.medium] || [];
        var sizeObj = sizes.find(function (s) { return s.id === state.sizeId; });
        var sizeLbl = sizeObj ? sizeObj.label : state.sizeId;

        if (state.medium === 'fine-art-paper') {
            var paper = PAPER_TYPES.find(function (p) { return p.id === state.paperType; });
            return sizeLbl + ' \u00b7 ' + (paper ? paper.label : 'Fine Art Print');
        }
        if (state.medium === 'framed-fine-art-paper') {
            var frame  = FRAME_OPTIONS.find(function (f) { return f.id === state.frameId; });
            var mat    = MAT_SIZES.find(function (m) { return m.id === state.matSizeId; });
            var matStr = (mat && mat.id !== 64) ? ' \u00b7 ' + mat.label + ' Mat' : '';
            return sizeLbl + ' \u00b7 Framed \u00b7 ' + (frame ? frame.label : '') + matStr;
        }
        if (state.medium === 'canvas') {
            var border = CANVAS_BORDERS.find(function (b) { return b.id === state.canvasBorder; });
            return sizeLbl + ' \u00b7 Canvas \u00b7 ' + (border ? border.label : '');
        }
        return sizeLbl;
    }

    /* -------------------------------------------------------
       Lumaprints config — stored in cart item for future automation.
       imageUrl is null until high-res image hosting is configured.
       ------------------------------------------------------- */
    function buildLumaprintsConfig(painting) {
        var sizes   = PRINT_SIZES[state.medium] || [];
        var sizeObj = sizes.find(function (s) { return s.id === state.sizeId; });
        if (!sizeObj) return null;

        var config = {
            storeId:  PRINT_PROVIDER.storeId,
            width:    sizeObj.width,
            height:   sizeObj.height,
            imageUrl: (painting && painting.lumaprintsImageUrl) || null
        };

        if (state.medium === 'fine-art-paper') {
            var paper = PAPER_TYPES.find(function (p) { return p.id === state.paperType; });
            config.subcategoryId    = paper ? paper.lumaprintsSubcategoryId : 103001;
            config.orderItemOptions = [39]; /* No Bleed */
        }

        if (state.medium === 'framed-fine-art-paper') {
            var frame       = FRAME_OPTIONS.find(function (f) { return f.id === state.frameId; });
            var paperOptMap = { 'archival': 74, 'hot-press': 75, 'cold-press': 76, 'semi-gloss': 78 };
            config.subcategoryId    = frame ? frame.lumaprintsSubcategoryId : 105005;
            config.orderItemOptions = [
                state.matSizeId,                        /* Mat Size */
                paperOptMap[state.paperType] || 74,     /* Paper Type (within frame) */
                83,                                     /* Hardware: Hanging Wire */
                95,                                     /* Backing: Kraft Paper */
                state.matColorId,                       /* Mat Color */
                146,                                    /* Glazing: Acrylic Glass */
                148                                     /* Mounting: Dry Mounted to Foam Core */
            ];
        }

        if (state.medium === 'canvas') {
            config.subcategoryId    = 101002; /* 1.25in Stretched Canvas */
            config.orderItemOptions = [
                state.canvasBorder, /* Border: Image Wrap or Mirror Wrap */
                11,                 /* Hardware: Sawtooth */
                259                 /* Finish: Matte */
            ];
        }

        return config;
    }

    /* -------------------------------------------------------
       HTML helpers — option lists
       ------------------------------------------------------- */
    function sizeOptionsHTML(medium) {
        return (PRINT_SIZES[medium] || []).map(function (s) {
            return '<option value="' + s.id + '">' + s.label + '</option>';
        }).join('');
    }

    /* -------------------------------------------------------
       Build the panel HTML
       ------------------------------------------------------- */
    function buildPanel(painting) {
        var defaultPrice = calculatePrice();

        function opts(arr, valKey, lblKey) {
            return arr.map(function (o) {
                return '<option value="' + o[valKey] + '">' + o[lblKey] + '</option>';
            }).join('');
        }

        return (
            '<div class="print-panel" id="printPanel">' +
                '<div class="print-panel__label">Fine Art Print</div>' +
                '<div class="print-panel__availability">' +
                    printAvailabilityLabel(painting.status) +
                '</div>' +

                /* Medium */
                '<div class="print-panel__field">' +
                    '<label class="print-panel__field-label" for="ppMedium">Type</label>' +
                    '<select class="form__select print-panel__select" id="ppMedium" aria-label="Select print type">' +
                        opts(PRINT_MEDIA, 'id', 'label') +
                    '</select>' +
                '</div>' +

                /* Size */
                '<div class="print-panel__field">' +
                    '<label class="print-panel__field-label" for="ppSize">Size</label>' +
                    '<select class="form__select print-panel__select" id="ppSize" aria-label="Select size">' +
                        sizeOptionsHTML('fine-art-paper') +
                    '</select>' +
                '</div>' +

                /* Paper type \u2014 fine art paper only */
                '<div class="print-panel__field" id="ppPaperField">' +
                    '<label class="print-panel__field-label" for="ppPaper">Paper</label>' +
                    '<select class="form__select print-panel__select" id="ppPaper" aria-label="Select paper type">' +
                        opts(PAPER_TYPES, 'id', 'label') +
                    '</select>' +
                '</div>' +

                /* Frame \u2014 framed only, hidden initially */
                '<div class="print-panel__field" id="ppFrameField" style="display:none">' +
                    '<label class="print-panel__field-label" for="ppFrame">Frame</label>' +
                    '<select class="form__select print-panel__select" id="ppFrame" aria-label="Select frame">' +
                        opts(FRAME_OPTIONS, 'id', 'label') +
                    '</select>' +
                '</div>' +

                /* Mat size \u2014 framed only, hidden initially */
                '<div class="print-panel__field" id="ppMatSizeField" style="display:none">' +
                    '<label class="print-panel__field-label" for="ppMatSize">Mat</label>' +
                    '<select class="form__select print-panel__select" id="ppMatSize" aria-label="Select mat size">' +
                        opts(MAT_SIZES, 'id', 'label') +
                    '</select>' +
                '</div>' +

                /* Mat color \u2014 framed + mat selected only, hidden initially */
                '<div class="print-panel__field" id="ppMatColorField" style="display:none">' +
                    '<label class="print-panel__field-label" for="ppMatColor">Mat Color</label>' +
                    '<select class="form__select print-panel__select" id="ppMatColor" aria-label="Select mat color">' +
                        opts(MAT_COLORS, 'id', 'label') +
                    '</select>' +
                '</div>' +

                /* Canvas border \u2014 canvas only, hidden initially */
                '<div class="print-panel__field" id="ppBorderField" style="display:none">' +
                    '<label class="print-panel__field-label" for="ppBorder">Border</label>' +
                    '<select class="form__select print-panel__select" id="ppBorder" aria-label="Select canvas border">' +
                        opts(CANVAS_BORDERS, 'id', 'label') +
                    '</select>' +
                '</div>' +

                /* Quantity */
                '<div class="print-panel__field">' +
                    '<label class="print-panel__field-label" for="ppQty">Quantity</label>' +
                    '<select class="form__select print-panel__select" id="ppQty" aria-label="Select quantity">' +
                        [1,2,3,4,5].map(function (n) {
                            return '<option value="' + n + '">' + n + '</option>';
                        }).join('') +
                    '</select>' +
                '</div>' +

                '<div class="print-panel__price-row">' +
                    '<span class="print-panel__price-label">Price</span>' +
                    '<span class="print-panel__price" id="ppPrice">$' + defaultPrice.toFixed(2) + '</span>' +
                '</div>' +
                '<p class="print-panel__shipping-note">Shipping included \u00b7 Continental US</p>' +
                '<button class="print-panel__add-btn" id="ppAddBtn">Add to Cart</button>' +
            '</div>'
        );
    }

    /* -------------------------------------------------------
       Inject / update / remove panel in lightbox info column
       ------------------------------------------------------- */
    function injectPanel(painting) {
        removePanel();
        currentPainting = painting;

        /* Reset state to defaults each time panel opens */
        state.medium       = 'fine-art-paper';
        state.sizeId       = '8x10';
        state.paperType    = 'archival';
        state.frameId      = '105005';
        state.matSizeId    = 64;
        state.matColorId   = 96;
        state.canvasBorder = 1;
        state.qty          = 1;

        var info = document.querySelector('.lightbox__info');
        if (!info) return;

        var wrapper = document.createElement('div');
        wrapper.innerHTML = buildPanel(painting);
        var panel = wrapper.firstChild;
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
        var mediumSel    = panel.querySelector('#ppMedium');
        var sizeSel      = panel.querySelector('#ppSize');
        var paperSel     = panel.querySelector('#ppPaper');
        var frameSel     = panel.querySelector('#ppFrame');
        var matSizeSel   = panel.querySelector('#ppMatSize');
        var matColorSel  = panel.querySelector('#ppMatColor');
        var borderSel    = panel.querySelector('#ppBorder');
        var qtySel       = panel.querySelector('#ppQty');
        var priceDisplay = panel.querySelector('#ppPrice');
        var addBtn       = panel.querySelector('#ppAddBtn');

        var paperField    = panel.querySelector('#ppPaperField');
        var frameField    = panel.querySelector('#ppFrameField');
        var matSizeField  = panel.querySelector('#ppMatSizeField');
        var matColorField = panel.querySelector('#ppMatColorField');
        var borderField   = panel.querySelector('#ppBorderField');

        function updateVisibility() {
            var m = state.medium;
            paperField.style.display    = m === 'fine-art-paper'        ? '' : 'none';
            frameField.style.display    = m === 'framed-fine-art-paper' ? '' : 'none';
            matSizeField.style.display  = m === 'framed-fine-art-paper' ? '' : 'none';
            borderField.style.display   = m === 'canvas'                ? '' : 'none';
            matColorField.style.display = (m === 'framed-fine-art-paper' && state.matSizeId !== 64) ? '' : 'none';
        }

        function updateSizeOptions() {
            var sizes = PRINT_SIZES[state.medium] || [];
            sizeSel.innerHTML = sizes.map(function (s) {
                return '<option value="' + s.id + '">' + s.label + '</option>';
            }).join('');
            state.sizeId = sizes.length ? sizes[0].id : '';
        }

        function updatePrice() {
            priceDisplay.textContent = '$' + calculatePrice().toFixed(2);
        }

        mediumSel.addEventListener('change', function () {
            state.medium = this.value;
            updateSizeOptions();
            updateVisibility();
            updatePrice();
            if (window.RiverbendAnalytics) {
                window.RiverbendAnalytics.printSizeSelect(state.medium + '-' + state.sizeId, calculatePrice() / state.qty);
            }
        });

        sizeSel.addEventListener('change', function () {
            state.sizeId = this.value;
            updatePrice();
        });

        paperSel.addEventListener('change', function () {
            state.paperType = this.value;
            updatePrice();
        });

        frameSel.addEventListener('change', function () {
            state.frameId = this.value;
        });

        matSizeSel.addEventListener('change', function () {
            state.matSizeId = parseInt(this.value, 10);
            if (state.matSizeId === 64) {
                state.matColorId = MAT_COLORS[0].id;
            }
            updateVisibility();
        });

        matColorSel.addEventListener('change', function () {
            state.matColorId = parseInt(this.value, 10);
        });

        borderSel.addEventListener('change', function () {
            state.canvasBorder = parseInt(this.value, 10);
        });

        qtySel.addEventListener('change', function () {
            state.qty = parseInt(this.value, 10) || 1;
            updatePrice();
        });

        addBtn.addEventListener('click', function () {
            var unitPrice = calculatePrice() / (state.qty || 1);

            Cart.addItem({
                artworkTitle:   painting.title,
                artworkId:      painting.id,
                artworkImage:   painting.image,
                printSize:      buildConfigKey(),
                printSizeLabel: buildConfigLabel(),
                unitPrice:      unitPrice,
                quantity:       state.qty,
                lumaprints:     buildLumaprintsConfig(painting)
            });

            addBtn.textContent = 'Added to Cart \u2713';
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
