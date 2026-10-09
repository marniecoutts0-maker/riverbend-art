// White-glove inquiry form — reads piece context from the URL (set by the gallery
// lightbox's "Inquire About This Work" link) and opens a prefilled email on submit.
// The site has no backend, so email is the delivery mechanism, same as every other
// contact path on this site (Fur Traders, general contact, commissions).
(function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var nameInput = document.getElementById('inquiryName');
    var emailInput = document.getElementById('inquiryEmail');
    var messageInput = document.getElementById('inquiryMessage');
    var errorEl = document.getElementById('inquiryError');
    var successEl = document.getElementById('inquirySuccess');
    var contextEl = document.getElementById('inquiryContext');
    var contextTitleEl = document.getElementById('inquiryContextTitle');
    var contextMetaEl = document.getElementById('inquiryContextMeta');

    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var RECIPIENT = 'marnie@riverbendartgallery.com';

    var params = new URLSearchParams(window.location.search);
    var pieceTitle = params.get('title');
    var pieceSize = params.get('size');
    var piecePrice = params.get('price');

    if (pieceTitle) {
        contextTitleEl.textContent = pieceTitle;
        var metaParts = [];
        if (pieceSize) metaParts.push(pieceSize);
        if (piecePrice) metaParts.push('$' + piecePrice);
        contextMetaEl.textContent = metaParts.join(' \u00b7 ');
        contextEl.hidden = false;
        messageInput.value = 'Hi Marnie, I\'m interested in "' + pieceTitle + '"' +
            (piecePrice ? ' ($' + piecePrice + ')' : '') + '. ';
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
    }

    function clearError() {
        errorEl.hidden = true;
        errorEl.textContent = '';
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var name = nameInput.value.trim();
        var email = emailInput.value.trim();

        if (!name) {
            showError('Please enter your name.');
            nameInput.focus();
            return;
        }
        if (!EMAIL_PATTERN.test(email)) {
            showError('Please enter a valid email address.');
            emailInput.focus();
            return;
        }

        clearError();

        var subject = pieceTitle ? ('Inquiry: ' + pieceTitle) : 'Website Inquiry';
        var bodyLines = ['Name: ' + name, 'Email: ' + email];
        if (pieceTitle) {
            bodyLines.push('Piece: ' + pieceTitle);
            if (pieceSize) bodyLines.push('Size: ' + pieceSize);
            if (piecePrice) bodyLines.push('Price: $' + piecePrice);
        }
        bodyLines.push('', messageInput.value.trim());

        var mailto = 'mailto:' + RECIPIENT +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(bodyLines.join('\n'));

        window.location.href = mailto;

        form.hidden = true;
        successEl.hidden = false;
    });

    messageInput.addEventListener('input', function () {
        if (!errorEl.hidden) clearError();
    });
    nameInput.addEventListener('input', function () {
        if (!errorEl.hidden) clearError();
    });
    emailInput.addEventListener('input', function () {
        if (!errorEl.hidden) clearError();
    });
})();
