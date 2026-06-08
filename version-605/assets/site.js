(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!opened));
      mobileNav.hidden = opened;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('active', thumbIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.global-search-input'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderSearch(input) {
    var panel = input.closest('.global-search').querySelector('.global-search-panel');
    var value = normalize(input.value);
    if (!panel) {
      return;
    }
    if (!value || !window.SEARCH_INDEX) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    var terms = value.split(/\s+/).filter(Boolean);
    var results = window.SEARCH_INDEX.filter(function (item) {
      var text = normalize(item.t + ' ' + item.y + ' ' + item.r + ' ' + item.g + ' ' + item.k);
      return terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
    }).slice(0, 12);
    panel.innerHTML = results.map(function (item) {
      return '<a class="search-result" href="' + item.u + '"><img src="' + item.c + '" alt="' + escapeHtml(item.t) + '"><span><strong>' + escapeHtml(item.t) + '</strong><span>' + escapeHtml(item.r + ' · ' + item.y + ' · ' + item.g) + '</span></span></a>';
    }).join('');
    panel.hidden = results.length === 0;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[match];
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input);
    });
    input.addEventListener('focus', function () {
      renderSearch(input);
    });
  });

  document.addEventListener('click', function (event) {
    searchInputs.forEach(function (input) {
      var form = input.closest('.global-search');
      var panel = form && form.querySelector('.global-search-panel');
      if (panel && !form.contains(event.target)) {
        panel.hidden = true;
      }
    });
  });

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('.filter-form'));

  filterForms.forEach(function (form) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var fields = Array.prototype.slice.call(form.querySelectorAll('input'));

    function applyFilter() {
      var keyword = normalize(form.querySelector('[name="keyword"]') && form.querySelector('[name="keyword"]').value);
      var year = normalize(form.querySelector('[name="year"]') && form.querySelector('[name="year"]').value);
      var region = normalize(form.querySelector('[name="region"]') && form.querySelector('[name="region"]').value);
      var genre = normalize(form.querySelector('[name="genre"]') && form.querySelector('[name="genre"]').value);

      cards.forEach(function (card) {
        var titleText = normalize(card.getAttribute('data-title'));
        var yearText = normalize(card.getAttribute('data-year'));
        var regionText = normalize(card.getAttribute('data-region'));
        var genreText = normalize(card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
        var visible = true;
        if (keyword && titleText.indexOf(keyword) === -1 && genreText.indexOf(keyword) === -1) {
          visible = false;
        }
        if (year && yearText.indexOf(year) === -1) {
          visible = false;
        }
        if (region && regionText.indexOf(region) === -1) {
          visible = false;
        }
        if (genre && genreText.indexOf(genre) === -1) {
          visible = false;
        }
        card.classList.toggle('is-hidden', !visible);
      });
    }

    fields.forEach(function (field) {
      field.addEventListener('input', applyFilter);
    });
  });
})();
