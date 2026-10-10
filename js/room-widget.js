/* ============================================================
   RIVERBEND ART — Room Visualizer Widgets (ArtPlacer)
   Injects both the Client Room (upload your own wall) and
   Sample Room (curated spaces) widget triggers into the
   lightbox for whichever painting is currently open.
   Both widget types share the same ArtPlacer loader script.
   ============================================================ */

var RoomWidget = (function () {
    'use strict';

    var SITE_ORIGIN = 'https://riverbendartgallery.com';
    var ARTIST_NAME = 'Marnie Henry Coutts';
    var scriptLoading = false;
    var scriptLoaded = false;
    var pendingPainting = null;

    /* paintings.json sizes are written "H x W in." — first number is height */
    function parseHeightInches(sizeStr) {
        var match = String(sizeStr || '').match(/(\d+(\.\d+)?)/);
        return match ? match[1] : '';
    }

    function absoluteImageUrl(path) {
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        return SITE_ORIGIN + '/' + path.replace(/^\/+/, '');
    }

    function sharedArtworkFields(painting) {
        return {
            artwork_url: absoluteImageUrl(painting.image),
            height: parseHeightInches(painting.size),
            title: painting.title,
            size: painting.size,
            price: painting.price ? String(painting.price) : '',
            artist: ARTIST_NAME
        };
    }

    function removeAnchor(id) {
        var existing = document.getElementById(id);
        if (existing) existing.remove();
    }

    /* ArtPlacer.insert() places the button as a sibling AFTER the anchor
       (not inside it), so removing the anchor alone leaves the button
       orphaned in the DOM — it must be purged by its own classname too. */
    function removeWidgetButtons() {
        document.querySelectorAll('.room-widget-cta, .sample-room-cta').forEach(function (btn) {
            btn.remove();
        });
    }

    function appendAnchor(id) {
        var info = document.querySelector('.lightbox__info');
        if (!info) return null;
        removeAnchor(id);
        removeWidgetButtons();
        var anchor = document.createElement('div');
        anchor.id = id;
        info.appendChild(anchor);
        return anchor;
    }

    function insertClientRoom(painting) {
        if (!appendAnchor('clientRoomAnchor') || typeof ArtPlacer === 'undefined') return;

        ArtPlacer.insert(Object.assign({
            gallery: '187499',
            resizable: 'false',
            frames: 'true',
            rotate: 'false',
            dimensions_standard: 'hxw',
            default_wall_dimension: 'height',
            unit: 'in',
            catalog: 'false',
            data_capture_form: 'false',
            type: '1',
            lang: 'en',
            text: 'See It In Your Room',
            classname: 'room-widget-cta',
            after: '#clientRoomAnchor'
        }, sharedArtworkFields(painting)));
    }

    function insertSampleRoom(painting) {
        if (!appendAnchor('sampleRoomAnchor') || typeof ArtPlacer === 'undefined') return;

        ArtPlacer.insert(Object.assign({
            gallery: '187499',
            resizable: 'false',
            frames: 'true',
            rotate: 'false',
            dimensions_standard: 'hxw',
            default_wall_dimension: 'height',
            unit: 'in',
            catalog: 'false',
            data_capture_form: 'false',
            type: '2',
            lang: 'en',
            space: '122570',
            additional_spaces: '122570,236535,156975,122591,73602,17841,122613',
            text: 'View In A Room',
            classname: 'sample-room-cta',
            after: '#sampleRoomAnchor'
        }, sharedArtworkFields(painting)));
    }

    function insertBoth(painting) {
        /* Sample Room first, then Client Room — so Client Room (the standout, upload-your-own option) lands last/closest to view */
        insertSampleRoom(painting);
        insertClientRoom(painting);
    }

    function show(painting) {
        if (!painting || !painting.image) { hide(); return; }
        pendingPainting = painting;

        if (scriptLoaded) {
            insertBoth(pendingPainting);
            return;
        }
        if (scriptLoading) return; /* already-queued onload will use latest pendingPainting */

        scriptLoading = true;
        var script = document.createElement('script');
        script.src = 'https://widget.artplacer.com/js/script.js';
        script.onload = function () {
            scriptLoaded = true;
            scriptLoading = false;
            if (pendingPainting) insertBoth(pendingPainting);
        };
        document.head.appendChild(script);
    }

    function hide() {
        removeAnchor('clientRoomAnchor');
        removeAnchor('sampleRoomAnchor');
        removeWidgetButtons();
        pendingPainting = null;
    }

    return { show: show, hide: hide };

})();
