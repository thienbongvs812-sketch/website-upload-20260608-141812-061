(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

    inputs.forEach(function (input) {
        var selector = input.getAttribute('data-target');
        var items = Array.prototype.slice.call(document.querySelectorAll(selector));

        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();

            items.forEach(function (item) {
                var haystack = item.textContent + ' ' + Array.prototype.map.call(item.attributes, function (attr) {
                    return attr.value;
                }).join(' ');
                item.style.display = haystack.toLowerCase().indexOf(value) >= 0 ? '' : 'none';
            });
        });
    });

    var query = new URLSearchParams(window.location.search).get('q');

    if (query && inputs.length) {
        inputs[0].value = query;
        inputs[0].dispatchEvent(new Event('input'));
    }
})();
