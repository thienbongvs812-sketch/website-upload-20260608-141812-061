(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            var opened = nav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var searchForms = document.querySelectorAll('[data-search-jump]');
    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            var url = './search.html';
            if (query) {
                url += '?q=' + encodeURIComponent(query);
            }
            window.location.href = url;
        });
    });

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var searchInput = filterRoot.querySelector('[data-filter-text]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var regionSelect = filterRoot.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
        var emptyState = filterRoot.querySelector('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var text = normalize(searchInput ? searchInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchedText = !text || haystack.indexOf(text) !== -1;
                var matchedYear = !year || card.getAttribute('data-year') === year;
                var matchedRegion = !region || card.getAttribute('data-region') === region;
                var show = matchedText && matchedYear && matchedRegion;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        [searchInput, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-action');
        var playUrl = shell.getAttribute('data-play');
        var hlsInstance = null;

        function prepare() {
            if (!video || !playUrl || video.getAttribute('data-ready') === '1') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playUrl;
            }

            video.setAttribute('data-ready', '1');
        }

        function playVideo() {
            prepare();
            if (!video) {
                return;
            }
            var attempt = video.play();
            if (attempt && typeof attempt.then === 'function') {
                attempt.then(function () {
                    shell.classList.add('is-playing');
                }).catch(function () {
                    shell.classList.remove('is-playing');
                });
            } else {
                shell.classList.add('is-playing');
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
        }
    });
})();
