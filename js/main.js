/* ============================================
   RIVERBEND ART — JavaScript
   JSON-driven gallery, navigation, lightbox
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('nav__links--open');
        });

        // Close menu when a nav link is tapped
        navLinks.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav__links--open');
            });
        });

        // Close menu when tapping the overlay background
        navLinks.addEventListener('click', (e) => {
            if (e.target === navLinks) {
                navLinks.classList.remove('nav__links--open');
            }
        });
    }

    // --- Transparent Nav Scroll Behavior (Home page only) ---
    const nav = document.getElementById('nav');

    if (nav && nav.classList.contains('nav--transparent')) {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                nav.classList.add('nav--scrolled');
            } else {
                nav.classList.remove('nav--scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // --- Status Label Map ---
    const statusLabels = {
        'available': '',
        'private-collection': 'In Private Collection',
        'commissioned': 'Commissioned Work'
    };

    // --- Build a single painting card ---
    function createPaintingCard(painting, isGallery) {
        const wrapper = isGallery ? document.createElement('div') : document.createElement('a');
        wrapper.className = 'grid__item';

        if (!isGallery) {
            wrapper.href = 'gallery.html';
        }

        if (isGallery) {
            wrapper.setAttribute('data-title', painting.title);
            wrapper.setAttribute('data-medium', painting.medium);
            wrapper.setAttribute('data-size', painting.size);
            wrapper.setAttribute('data-src', painting.image);
            wrapper.setAttribute('data-status', painting.status);
            wrapper.setAttribute('data-category', painting.category);
        }

        const orientationClass = painting.orientation === 'landscape'
            ? ' grid__image-wrapper--landscape' : '';

        const statusHTML = statusLabels[painting.status]
            ? '<div class="grid__status">' + statusLabels[painting.status] + '</div>'
            : '';

        wrapper.innerHTML =
            '<div class="grid__image-wrapper' + orientationClass + '">' +
                '<img src="' + painting.image + '" alt="' + painting.title + '" class="grid__image" loading="lazy">' +
            '</div>' +
            '<div class="grid__caption">' +
                '<div class="grid__title">' + painting.title + '</div>' +
                '<div class="grid__meta">' + painting.medium + '</div>' +
                statusHTML +
            '</div>';

        return wrapper;
    }

    // --- Load paintings data and render ---
    function loadPaintings(callback) {
        // Try fetch first (works on web servers)
        if (window.location.protocol !== 'file:') {
            fetch('paintings.json')
                .then(function(r) { return r.json(); })
                .then(callback)
                .catch(function(err) {
                    console.error('Failed to load paintings data:', err);
                });
        } else if (typeof window.PAINTINGS_DATA !== 'undefined') {
            // Fallback for local file:// — data embedded via paintings-data.js
            callback(window.PAINTINGS_DATA);
        } else {
            // Last resort — load via script injection
            var s = document.createElement('script');
            s.src = 'js/paintings-data.js';
            s.onload = function() {
                if (typeof window.PAINTINGS_DATA !== 'undefined') {
                    callback(window.PAINTINGS_DATA);
                }
            };
            document.head.appendChild(s);
        }
    }

    loadPaintings(function(paintings) {

            // HOME PAGE — Featured Grid
            var homeGrid = document.getElementById('homeGrid');
            if (homeGrid) {
                paintings.filter(function(p) { return p.featured; }).forEach(function(painting) {
                    homeGrid.appendChild(createPaintingCard(painting, false));
                });
            }

            // GALLERY PAGE — Full Grid + Filters
            var galleryGrid = document.getElementById('galleryGrid');
            if (galleryGrid) {
                paintings.forEach(function(painting) {
                    galleryGrid.appendChild(createPaintingCard(painting, true));
                });

                // --- Filter Tabs ---
                var filterBtns = document.querySelectorAll('.filters__btn');
                filterBtns.forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        filterBtns.forEach(function(b) { b.classList.remove('filters__btn--active'); });
                        btn.classList.add('filters__btn--active');

                        var filter = btn.getAttribute('data-filter');
                        var items = galleryGrid.querySelectorAll('.grid__item');

                        items.forEach(function(item) {
                            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                                item.classList.remove('grid__item--hidden');
                            } else {
                                item.classList.add('grid__item--hidden');
                            }
                        });
                    });
                });

                // --- Lightbox (event delegation) ---
                var lightbox = document.getElementById('lightbox');
                var lightboxImage = document.getElementById('lightboxImage');
                var lightboxTitle = document.getElementById('lightboxTitle');
                var lightboxMedium = document.getElementById('lightboxMedium');
                var lightboxSize = document.getElementById('lightboxSize');
                var lightboxStatus = document.getElementById('lightboxStatus');
                var lightboxClose = document.getElementById('lightboxClose');

                if (lightbox) {
                    galleryGrid.addEventListener('click', function(e) {
                        var item = e.target.closest('.grid__item[data-title]');
                        if (!item) return;

                        lightboxImage.src = item.getAttribute('data-src');
                        lightboxImage.alt = item.getAttribute('data-title');
                        lightboxTitle.textContent = item.getAttribute('data-title');
                        lightboxMedium.textContent = item.getAttribute('data-medium');
                        lightboxSize.textContent = item.getAttribute('data-size');

                        if (lightboxStatus) {
                            var label = statusLabels[item.getAttribute('data-status')];
                            lightboxStatus.textContent = label || '';
                            lightboxStatus.style.display = label ? 'block' : 'none';
                        }

                        lightbox.classList.add('lightbox--active');
                        document.body.style.overflow = 'hidden';
                    });

                    var closeLightbox = function() {
                        lightbox.classList.remove('lightbox--active');
                        document.body.style.overflow = '';
                    };

                    if (lightboxClose) {
                        lightboxClose.addEventListener('click', closeLightbox);
                    }

                    lightbox.addEventListener('click', function(e) {
                        if (e.target === lightbox) closeLightbox();
                    });

                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Escape' && lightbox.classList.contains('lightbox--active')) {
                            closeLightbox();
                        }
                    });
                }
            }
    });

    // --- Contact Form Handler ---
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('.form__submit');
            const originalText = btn.textContent;
            btn.textContent = 'Message Sent — Thank You';
            btn.disabled = true;
            btn.style.opacity = '0.6';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
                contactForm.reset();
            }, 3000);
        });
    }

});
