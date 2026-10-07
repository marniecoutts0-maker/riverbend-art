// Native collector list signup form — submits via a hidden iframe target to Buttondown.
// This is Buttondown's documented HTML-form method (not fetch), so no CORS/no-cors opacity,
// and no visible navigation since the response lands in an off-screen iframe.
(function () {
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const form = document.getElementById('collectorSignupForm');
    if (!form) return;

    const input = document.getElementById('collectorSignupEmail');
    const errorEl = document.getElementById('collectorSignupError');
    const submitBtn = document.getElementById('collectorSignupSubmit');
    const successEl = document.getElementById('collectorSignupSuccess');
    const targetFrame = document.getElementById('collectorSignupTarget');

    let submitted = false;

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
        input.setAttribute('aria-invalid', 'true');
    }

    function clearError() {
        errorEl.hidden = true;
        errorEl.textContent = '';
        input.removeAttribute('aria-invalid');
    }

    // The iframe fires "load" once for its initial blank page, then again once
    // Buttondown finishes processing our submission — only react to the latter.
    if (targetFrame) {
        targetFrame.addEventListener('load', function () {
            if (!submitted) return;
            form.hidden = true;
            successEl.hidden = false;
        });
    }

    form.addEventListener('submit', function (event) {
        const email = input.value.trim();
        if (!EMAIL_PATTERN.test(email)) {
            event.preventDefault();
            showError('Please enter a valid email address.');
            input.focus();
            return;
        }

        clearError();
        submitted = true;
        submitBtn.textContent = 'Subscribing…';
        // No preventDefault: let the browser submit natively into the hidden iframe.
    });

    input.addEventListener('input', function () {
        if (!errorEl.hidden) clearError();
    });
})();

