/* ============================================================
   RIVERBEND ART — Print Order Panel
   Injected into the existing lightbox for print-available works.
   Handles medium / size / options selection, dynamic pricing, and cart add.
   ============================================================ */

var PrintOrder = (function () {
    'use strict';

    var currentPainting = null;
    var _imageCache     = {};
    var _activeRoomScene = null;

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
        /* Use LE prices when painting has limitedEdition pricing */
        var le = currentPainting && currentPainting.limitedEdition;
        var lePrices = le && le.prices && le.prices[state.medium];
        if (lePrices) {
            var leSize = lePrices[state.sizeId];
            if (leSize === undefined || leSize === null) return 0;
            if (state.medium === 'framed-fine-art-paper') {
                var leFrame    = FRAME_OPTIONS.find(function (f) { return f.id === state.frameId; });
                var leFrameAdj = (leFrame && leFrame.priceAdj) ? leFrame.priceAdj : 0;
                return (leSize + leFrameAdj) * state.qty;
            }
            return leSize * state.qty;
        }

        var prices = PRINT_PRICES[state.medium];
        if (!prices) return 0;
        var sizePrice = prices[state.sizeId];
        if (sizePrice === undefined || sizePrice === null) return 0;

        if (state.medium === 'fine-art-paper') {
            var adj = (state.paperType === 'hot-press' || state.paperType === 'cold-press')
                ? sizePrice.hotPressAdj : 0;
            return (sizePrice.base + adj) * state.qty;
        }
        if (state.medium === 'framed-fine-art-paper') {
            var frame    = FRAME_OPTIONS.find(function (f) { return f.id === state.frameId; });
            var frameAdj = (frame && frame.priceAdj) ? frame.priceAdj : 0;
            return (sizePrice + frameAdj) * state.qty;
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
       Preview canvas — image loading and drawing
       ------------------------------------------------------- */
    function loadImage(src, callback) {
        if (_imageCache[src]) {
            callback(_imageCache[src]);
            return;
        }
        var img = new Image();
        img.onload = function () {
            _imageCache[src] = img;
            callback(img);
        };
        img.onerror = function () {
            callback(null);
        };
        img.src = src;
    }

    function drawWoodGrain(ctx, x, y, w, h, baseColor, horizontal) {
        var r  = parseInt(baseColor.slice(1, 3), 16);
        var gv = parseInt(baseColor.slice(3, 5), 16);
        var b  = parseInt(baseColor.slice(5, 7), 16);
        var dR = Math.max(0, r - 60);
        var dG = Math.max(0, gv - 50);
        var dB = Math.max(0, b - 28);

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();

        var span  = horizontal ? h : w;
        var len   = horizontal ? w : h;
        var count = Math.floor(span / 2.2) + 4;

        for (var i = 0; i < count; i++) {
            var t     = i / count;
            var base  = (horizontal ? y : x) + t * span;
            var alpha = 0.10 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 0.38;
            ctx.strokeStyle = 'rgba(' + dR + ',' + dG + ',' + dB + ',' + alpha.toFixed(2) + ')';
            ctx.lineWidth = 0.5 + (Math.sin(i * 5.1) * 0.5 + 0.5) * 1.6;
            ctx.beginPath();
            if (horizontal) {
                ctx.moveTo(x, base);
                for (var xi = 0; xi <= len; xi += 5) {
                    ctx.lineTo(x + xi, base + Math.sin(xi * 0.09 + i * 2.3) * 1.4 + Math.sin(xi * 0.23 + i) * 0.6);
                }
            } else {
                ctx.moveTo(base, y);
                for (var yi = 0; yi <= len; yi += 5) {
                    ctx.lineTo(base + Math.sin(yi * 0.09 + i * 2.3) * 1.4 + Math.sin(yi * 0.23 + i) * 0.6, y + yi);
                }
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawGoldBevel(ctx, x, y, w, h, isPleinAir) {
        var grad = (w >= h)
            ? ctx.createLinearGradient(x, y, x, y + h)
            : ctx.createLinearGradient(x, y, x + w, y);

        if (isPleinAir) {
            /* Symmetric stepped bevel — base color shows through */
            grad.addColorStop(0,    'rgba(0,0,0,0.35)');
            grad.addColorStop(0.10, 'rgba(255,240,150,0.30)');
            grad.addColorStop(0.20, 'rgba(0,0,0,0.20)');
            grad.addColorStop(0.35, 'rgba(255,235,140,0.18)');
            grad.addColorStop(0.50, 'rgba(0,0,0,0.04)');
            grad.addColorStop(0.65, 'rgba(255,235,140,0.18)');
            grad.addColorStop(0.80, 'rgba(0,0,0,0.20)');
            grad.addColorStop(0.90, 'rgba(255,240,150,0.30)');
            grad.addColorStop(1,    'rgba(0,0,0,0.35)');
        } else {
            /* Narrow gold — symmetric single bevel */
            grad.addColorStop(0,    'rgba(0,0,0,0.30)');
            grad.addColorStop(0.28, 'rgba(255,240,150,0.25)');
            grad.addColorStop(0.50, 'rgba(0,0,0,0.04)');
            grad.addColorStop(0.72, 'rgba(255,240,150,0.22)');
            grad.addColorStop(1,    'rgba(0,0,0,0.28)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
    }

    function drawPreview(canvas, paintingImg) {
        var medium  = state.medium;
        var sizes   = PRINT_SIZES[medium] || [];
        var sizeObj = sizes.find(function (s) { return s.id === state.sizeId; });
        if (!sizeObj) return;

        var printW = sizeObj.width;
        var printH = sizeObj.height;

        var frameOpt    = null;
        var matSizeOpt  = null;
        var matColorOpt = null;
        var frameInches = 0;
        var matInches   = 0;

        if (medium === 'framed-fine-art-paper') {
            frameOpt    = FRAME_OPTIONS.find(function (f) { return f.id === state.frameId; });
            matSizeOpt  = MAT_SIZES.find(function (m) { return m.id === state.matSizeId; });
            matColorOpt = MAT_COLORS.find(function (m) { return m.id === state.matColorId; });
            frameInches = frameOpt ? (frameOpt.widthInches || 1.25) : 1.25;
            matInches   = matSizeOpt ? (matSizeOpt.widthInches || 0) : 0;
        }

        /* Scale so frame + mat + image all fit in 240px total width */
        var totalInchW = printW + 2 * (matInches + frameInches);
        var totalInchH = printH + 2 * (matInches + frameInches);
        var scale      = 240 / totalInchW;

        var imgW    = Math.round(printW * scale);
        var imgH    = Math.round(printH * scale);
        var matPx   = Math.round(matInches * scale);
        var framePx = Math.round(frameInches * scale);
        var totalW  = 240;
        var totalH  = Math.round(totalInchH * scale);

        canvas.width  = totalW;
        canvas.height = totalH;

        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, totalW, totalH);

        /* Frame — mitered 45° corners using trapezoid clip paths */
        if (frameOpt && framePx > 0) {
            var fStyle = frameOpt.previewStyle || 'solid';
            var fc     = frameOpt.previewColor || '#1c1c1c';
            var W = totalW, H = totalH, fp = framePx;
            var sections = [
                { pts: [[0,0],[W,0],[W-fp,fp],[fp,fp]],       bx: 0,    by: 0,    bw: W,  bh: fp, hz: true  },
                { pts: [[0,H],[W,H],[W-fp,H-fp],[fp,H-fp]],   bx: 0,    by: H-fp, bw: W,  bh: fp, hz: true  },
                { pts: [[0,0],[fp,fp],[fp,H-fp],[0,H]],        bx: 0,    by: 0,    bw: fp, bh: H,  hz: false },
                { pts: [[W,0],[W-fp,fp],[W-fp,H-fp],[W,H]],   bx: W-fp, by: 0,    bw: fp, bh: H,  hz: false }
            ];
            for (var si = 0; si < sections.length; si++) {
                var sec = sections[si];
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(sec.pts[0][0], sec.pts[0][1]);
                for (var k = 1; k < sec.pts.length; k++) ctx.lineTo(sec.pts[k][0], sec.pts[k][1]);
                ctx.closePath();
                ctx.clip();
                ctx.fillStyle = fc;
                ctx.fillRect(sec.bx, sec.by, sec.bw, sec.bh);
                if (fStyle === 'wood')           drawWoodGrain(ctx, sec.bx, sec.by, sec.bw, sec.bh, fc, sec.hz);
                else if (fStyle === 'gold')      drawGoldBevel(ctx, sec.bx, sec.by, sec.bw, sec.bh, false);
                else if (fStyle === 'plein-air-gold') drawGoldBevel(ctx, sec.bx, sec.by, sec.bw, sec.bh, true);
                ctx.restore();
            }
        }

        /* Mat */
        if (matPx > 0) {
            ctx.fillStyle = (matColorOpt && matColorOpt.previewColor) ? matColorOpt.previewColor : '#f8f8f6';
            ctx.fillRect(framePx, framePx, totalW - 2 * framePx, totalH - 2 * framePx);
        }

        /* Painting — centered crop into print dimensions */
        var paintX = framePx + matPx;
        var paintY = framePx + matPx;

        if (paintingImg) {
            var srcW      = paintingImg.naturalWidth;
            var srcH      = paintingImg.naturalHeight;
            var dstAspect = imgW / imgH;
            var srcAspect = srcW / srcH;
            var sx, sy, sw, sh;

            if (srcAspect > dstAspect) {
                /* Source is wider — crop sides */
                sh = srcH;
                sw = Math.round(srcH * dstAspect);
                sx = Math.round((srcW - sw) / 2);
                sy = 0;
            } else {
                /* Source is taller — crop top/bottom */
                sw = srcW;
                sh = Math.round(srcW / dstAspect);
                sx = 0;
                sy = Math.round((srcH - sh) / 2);
            }

            ctx.drawImage(paintingImg, sx, sy, sw, sh, paintX, paintY, imgW, imgH);
        } else {
            /* Placeholder while image loads */
            ctx.fillStyle = '#e0ddd8';
            ctx.fillRect(paintX, paintY, imgW, imgH);
        }

        /* Fine Art Paper: thin surrounding border */
        if (medium === 'fine-art-paper') {
            ctx.strokeStyle = '#c8c4bc';
            ctx.lineWidth = 1;
            ctx.strokeRect(0.5, 0.5, totalW - 1, totalH - 1);
        }

        /* Canvas: gallery-wrap side indicator */
        if (medium === 'canvas') {
            ctx.strokeStyle = '#3a3530';
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, totalW - 6, totalH - 6);
        }
    }

    function updatePreview() {
        var canvas = document.getElementById('ppPreviewCanvas');
        if (!canvas || !currentPainting) return;

        var src    = currentPainting.image;
        var cached = _imageCache[src] || null;

        /* Draw immediately — placeholder or cached painting */
        drawPreview(canvas, cached);

        /* Load painting image if not yet cached, then redraw */
        if (!cached) {
            loadImage(src, function (img) {
                drawPreview(canvas, img);
            });
        }
    }

    /* -------------------------------------------------------
       Room visualizer — caption, draw, update
       ------------------------------------------------------- */
    function buildRoomCaption() {
        var sizes   = PRINT_SIZES[state.medium] || [];
        var sizeObj = sizes.find(function (s) { return s.id === state.sizeId; });
        var sizeLabel = sizeObj ? sizeObj.label : '';
        var mediaObj  = PRINT_MEDIA.find(function (m) { return m.id === state.medium; });
        var typeLabel = mediaObj ? mediaObj.label : '';
        return sizeLabel + ' · ' + typeLabel + ' · approximate wall scale';
    }

    function drawRoomPreview(roomCanvas, paintingImg) {
        var scene = _activeRoomScene;
        if (!scene) return;

        var medium  = state.medium;
        var sizes   = PRINT_SIZES[medium] || [];
        var sizeObj = sizes.find(function (s) { return s.id === state.sizeId; });
        if (!sizeObj) return;

        var frameInches = 0, matInches = 0;
        if (medium === 'framed-fine-art-paper') {
            var fOpt = FRAME_OPTIONS.find(function (f) { return f.id === state.frameId; });
            var mOpt = MAT_SIZES.find(function (m) { return m.id === state.matSizeId; });
            frameInches = fOpt ? (fOpt.widthInches || 1.25) : 1.25;
            matInches   = mOpt ? (mOpt.widthInches || 0)    : 0;
        }

        var totalInchW = sizeObj.width  + 2 * (matInches + frameInches);
        var totalInchH = sizeObj.height + 2 * (matInches + frameInches);
        var roomScale  = scene.wallMaxWidthPx / scene.wallRealWidthIn;
        var artW = Math.min(Math.round(totalInchW * roomScale), scene.wallMaxWidthPx);
        var artH = Math.min(Math.round(totalInchH * roomScale), scene.wallMaxHeightPx);
        var artX = Math.round(scene.wallCenterX - artW / 2);
        var artY = Math.round(scene.wallCenterY - artH / 2);

        roomCanvas.width  = scene.imgWidth;
        roomCanvas.height = scene.imgHeight;
        var ctx = roomCanvas.getContext('2d');

        var roomImg = _imageCache[scene.img] || null;
        if (!roomImg) {
            ctx.fillStyle = '#e8e4de';
            ctx.fillRect(0, 0, scene.imgWidth, scene.imgHeight);
            loadImage(scene.img, function () { updateRoomPreview(); });
            return;
        }
        ctx.drawImage(roomImg, 0, 0);

        /* Drop shadow */
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.40)';
        ctx.shadowBlur = 10; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(artX, artY, artW, artH);
        ctx.restore();

        /* Render framed print via drawPreview() on offscreen canvas, then composite */
        var offscreen = document.createElement('canvas');
        drawPreview(offscreen, paintingImg);
        ctx.drawImage(offscreen, artX, artY, artW, artH);
    }

    function updateRoomPreview() {
        var roomCanvas = document.getElementById('ppRoomCanvas');
        var caption    = document.getElementById('ppRoomCaption');
        if (!roomCanvas || !_activeRoomScene || !currentPainting) return;

        var src    = currentPainting.image;
        var cached = _imageCache[src] || null;
        drawRoomPreview(roomCanvas, cached);
        if (!cached) {
            loadImage(src, function (img) { drawRoomPreview(roomCanvas, img); });
        }
        if (caption) caption.textContent = buildRoomCaption();
    }

    function updateAllPreviews() {
        updatePreview();
        updateRoomPreview();
    }
    function buildPanel(painting) {
        var defaultPrice = calculatePrice();
        var le        = painting.limitedEdition;
        var remaining = le ? (le.remaining !== undefined ? le.remaining : le.editionSize) : null;
        var soldOut   = le ? remaining === 0 : false;
        var leHTML    = '';
        if (le) {
            var urgentCls = (!soldOut && remaining <= 3) ? ' le-notice--urgent' : '';
            var cntText   = soldOut
                ? 'All ' + le.editionSize + ' prints in this edition have been claimed.'
                : remaining + ' of ' + le.editionSize + ' remaining';
            leHTML =
                '<div class="le-notice' + urgentCls + '">' +
                    '<div class="le-notice__title">Limited Edition Fine Art Print</div>' +
                    '<div class="le-notice__detail">' + le.note + '</div>' +
                    '<div class="le-notice__counter' + ((!soldOut && remaining <= 3) ? ' le-notice__counter--urgent' : '') + '">' + cntText + '</div>' +
                '</div>';
        }

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

                /* Preview canvas */
                '<div class="print-panel__preview">' +
                    '<canvas id="ppPreviewCanvas"></canvas>' +
                    '<p class="print-panel__preview-note">Preview — colors and proportions are approximate.</p>' +
                '</div>' +

                /* Room visualizer */
                '<div class="room-preview" id="ppRoomSection">' +
                    '<div class="room-preview__label">Room Preview</div>' +
                    '<div class="room-preview__scenes" id="ppSceneRow">' +
                        ROOM_SCENES.map(function (s, i) {
                            return '<button class="room-preview__scene-btn' + (i === 0 ? ' room-preview__scene-btn--active' : '') + '" data-scene-id="' + s.id + '" aria-label="' + s.label + '">' +
                                '<img src="' + s.thumb + '" alt="' + s.label + '" loading="lazy">' +
                                '<span>' + s.label + '</span>' +
                                '</button>';
                        }).join('') +
                    '</div>' +
                    '<div class="room-preview__canvas-wrap">' +
                        '<canvas id="ppRoomCanvas"></canvas>' +
                    '</div>' +
                    '<p class="room-preview__caption" id="ppRoomCaption"></p>' +
                '</div>' +

                leHTML +

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
                '<button class="print-panel__add-btn' + (soldOut ? ' print-panel__add-btn--sold-out' : '') + '" id="ppAddBtn"' + (soldOut ? ' disabled' : '') + '>' +
                    (soldOut ? 'Sold Out' : 'Add to Cart') +
                '</button>' +
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

        _activeRoomScene = ROOM_SCENES[0];
        ROOM_SCENES.forEach(function (scene) {
            if (!_imageCache[scene.img]) loadImage(scene.img, function () {});
        });

        bindPanelEvents(painting, panel);
        updateAllPreviews();
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
            updateAllPreviews();
            if (window.RiverbendAnalytics) {
                window.RiverbendAnalytics.printSizeSelect(state.medium + '-' + state.sizeId, calculatePrice() / state.qty);
            }
        });

        sizeSel.addEventListener('change', function () {
            state.sizeId = this.value;
            updatePrice();
            updateAllPreviews();
        });

        paperSel.addEventListener('change', function () {
            state.paperType = this.value;
            updatePrice();
        });

        frameSel.addEventListener('change', function () {
            state.frameId = this.value;
            updateAllPreviews();
        });

        matSizeSel.addEventListener('change', function () {
            state.matSizeId = parseInt(this.value, 10);
            if (state.matSizeId === 64) {
                state.matColorId = MAT_COLORS[0].id;
            }
            updateVisibility();
            updateAllPreviews();
        });

        matColorSel.addEventListener('change', function () {
            state.matColorId = parseInt(this.value, 10);
            updateAllPreviews();
        });

        borderSel.addEventListener('change', function () {
            state.canvasBorder = parseInt(this.value, 10);
        });

        qtySel.addEventListener('change', function () {
            state.qty = parseInt(this.value, 10) || 1;
            updatePrice();
        });

        addBtn.addEventListener('click', function () {
            var leGuard = currentPainting && currentPainting.limitedEdition;
            if (leGuard && leGuard.remaining === 0) return;
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

        /* Scene selector buttons */
        var sceneButtons = panel.querySelectorAll('.room-preview__scene-btn');
        sceneButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                sceneButtons.forEach(function (b) { b.classList.remove('room-preview__scene-btn--active'); });
                btn.classList.add('room-preview__scene-btn--active');
                var sceneId = btn.getAttribute('data-scene-id');
                _activeRoomScene = ROOM_SCENES.find(function (s) { return s.id === sceneId; }) || _activeRoomScene;
                updateRoomPreview();
            });
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
