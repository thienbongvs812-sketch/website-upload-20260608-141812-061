
(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      form.action = './search.html';
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
      thumbs.forEach(function (thumb, idx) {
        thumb.classList.toggle('is-active', idx === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5200);
    }

    function restartHero(index) {
      window.clearInterval(timer);
      setHero(index);
      startHero();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        restartHero(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        restartHero(Number(thumb.getAttribute('data-hero-thumb') || 0));
      });
    });

    startHero();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var searchInput = root.querySelector('[data-card-search]');
    var container = document.querySelector('[data-card-list]');
    var cards = container ? Array.prototype.slice.call(container.querySelectorAll('[data-card]')) : [];
    var empty = document.querySelector('[data-empty-state]');
    var activeYear = 'all';
    var activeType = 'all';

    function setActive(button, selector) {
      root.querySelectorAll(selector).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
    }

    function filterCards() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var yearOk = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
        var typeOk = activeType === 'all' || card.getAttribute('data-type') === activeType;
        var queryOk = !q || haystack.indexOf(q) !== -1;
        var visible = yearOk && typeOk && queryOk;
        card.classList.toggle('is-hidden-card', !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    root.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || 'all';
        setActive(button, '[data-filter-year]');
        filterCards();
      });
    });

    root.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || 'all';
        setActive(button, '[data-filter-type]');
        filterCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }

    var reset = root.querySelector('[data-filter-reset]');
    if (reset) {
      reset.addEventListener('click', function () {
        activeYear = 'all';
        activeType = 'all';
        if (searchInput) {
          searchInput.value = '';
        }
        root.querySelectorAll('[data-filter-year], [data-filter-type]').forEach(function (button) {
          var isAll = button.getAttribute('data-filter-year') === 'all' || button.getAttribute('data-filter-type') === 'all';
          button.classList.toggle('is-active', isAll);
        });
        filterCards();
      });
    }
  });

  var searchInput = document.querySelector('[data-search-page-input]');
  var searchForm = document.querySelector('[data-search-page-form]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');

  function searchCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-badge">播放</span>',
      '</a>',
      '<div class="movie-body">',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.line) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[item];
    });
  }

  function runSearch() {
    if (!searchInput || !searchResults || !window.SEARCH_INDEX) {
      return;
    }
    var q = searchInput.value.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '';
      if (searchEmpty) {
        searchEmpty.textContent = '输入关键词后显示匹配影片';
        searchEmpty.classList.add('is-visible');
      }
      return;
    }
    var words = q.split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_INDEX.filter(function (movie) {
      var haystack = movie.search.toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 80);
    searchResults.innerHTML = matched.map(searchCard).join('');
    if (searchEmpty) {
      searchEmpty.textContent = matched.length ? '' : '没有找到匹配影片';
      searchEmpty.classList.toggle('is-visible', matched.length === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;
    searchInput.addEventListener('input', runSearch);
    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = searchInput.value.trim();
        var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        history.replaceState(null, '', nextUrl);
        runSearch();
      });
    }
    runSearch();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('[data-video-player]');
    var playButton = player.querySelector('[data-play-button]');
    var configEl = document.getElementById('movie-config');
    var config = {};
    var hlsInstance = null;

    try {
      config = JSON.parse(configEl ? configEl.textContent : '{}');
    } catch (error) {
      config = {};
    }

    function playNow() {
      if (!video || !config.url) {
        return;
      }
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = config.url;
        }
        video.play().catch(function () {
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
        });
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!video.getAttribute('data-ready')) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(config.url);
          hlsInstance.attachMedia(video);
          video.setAttribute('data-ready', '1');
        }
        var start = function () {
          video.play().catch(function () {
            if (playButton) {
              playButton.classList.remove('is-hidden');
            }
          });
        };
        if (video.readyState >= 2) {
          start();
        } else {
          video.addEventListener('loadedmetadata', start, { once: true });
        }
      }
    }

    if (playButton) {
      playButton.addEventListener('click', playNow);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playNow();
        }
      });
      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
