(function() {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function() {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('is-locked', panel.classList.contains('is-open'));
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
        roots.forEach(function(root) {
            var input = root.querySelector('[data-filter-input]');
            var region = root.querySelector('[data-filter-region]');
            var type = root.querySelector('[data-filter-type]');
            var year = root.querySelector('[data-filter-year]');
            var category = root.querySelector('[data-filter-category]');
            var grid = root.parentElement.querySelector('.filter-grid');
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];
            var empty = root.querySelector('[data-no-results]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function update() {
                var query = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var categoryValue = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function(card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-category')
                    ].join(' '));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchRegion = !regionValue || normalize(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
                    var matchType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
                    var matchYear = !yearValue || normalize(card.getAttribute('data-year')).indexOf(yearValue) !== -1;
                    var matchCategory = !categoryValue || normalize(card.getAttribute('data-category')).indexOf(categoryValue) !== -1;
                    var show = matchQuery && matchRegion && matchType && matchYear && matchCategory;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, region, type, year, category].forEach(function(control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', update);
                control.addEventListener('change', update);
            });
            update();
        });
    }

    function bindPlayer(url, video, button) {
        var loaded = false;
        var shell = video.closest('.player-shell');

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
        }

        function start() {
            attach();
            if (shell) {
                shell.classList.add('is-playing');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function() {
            if (!loaded || video.paused) {
                start();
            }
        });
        video.addEventListener('play', function() {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });
    }

    window.initMoviePlayer = function(url, videoId, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !url) {
            return;
        }
        bindPlayer(url, video, button);
    };

    ready(function() {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
