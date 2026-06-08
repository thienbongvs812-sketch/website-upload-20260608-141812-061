(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  var toggle = $(".nav-toggle");
  var links = $(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = $all(".hero-slide");
  var dots = $all(".slider-dots button");
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterPanel = $("[data-filter-panel]");
  if (filterPanel) {
    var cards = $all(".movie-card");
    var search = $("[data-filter-search]");
    var year = $("[data-filter-year]");
    var region = $("[data-filter-region]");
    var type = $("[data-filter-type]");
    var empty = $("[data-empty]");
    var applyFilter = function () {
      var q = normalize(search && search.value);
      var y = year && year.value;
      var r = region && region.value;
      var t = type && type.value;
      var visible = 0;
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var genre = normalize(card.getAttribute("data-genre"));
        var pass = true;
        if (q && title.indexOf(q) === -1 && genre.indexOf(q) === -1) pass = false;
        if (y && card.getAttribute("data-year") !== y) pass = false;
        if (r && card.getAttribute("data-region").indexOf(r) === -1) pass = false;
        if (t && card.getAttribute("data-type").indexOf(t) === -1) pass = false;
        card.style.display = pass ? "" : "none";
        if (pass) visible += 1;
      });
      if (empty) empty.classList.toggle("is-visible", visible === 0);
    };
    [search, year, region, type].forEach(function (item) {
      if (item) item.addEventListener("input", applyFilter);
      if (item) item.addEventListener("change", applyFilter);
    });
  }

  var globalSearch = $("[data-global-search]");
  var globalResults = $("[data-global-results]");
  if (globalSearch && globalResults && Array.isArray(window.PINJIAN_MOVIES)) {
    var renderResults = function () {
      var q = normalize(globalSearch.value);
      globalResults.innerHTML = "";
      if (!q) return;
      var hits = window.PINJIAN_MOVIES.filter(function (movie) {
        var content = normalize(movie.title + " " + movie.year + " " + movie.region + " " + movie.type + " " + movie.genre + " " + movie.tags);
        return content.indexOf(q) !== -1;
      }).slice(0, 80);
      hits.forEach(function (movie) {
        var a = document.createElement("a");
        a.className = "compact-card";
        a.href = movie.url;
        a.innerHTML = '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, "&quot;") + '" loading="lazy"><span><strong>' + movie.title + '</strong><small>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</small></span>';
        globalResults.appendChild(a);
      });
    };
    globalSearch.addEventListener("input", renderResults);
  }
})();

function setupMoviePlayer(source) {
  var video = document.querySelector("video[data-player='main']");
  var overlay = document.querySelector(".player-overlay");
  var message = document.querySelector(".player-message");
  if (!video || !source) return;
  var ready = false;
  var hls = null;
  function showMessage(text) {
    if (!message) return;
    message.textContent = text;
    message.classList.add("is-visible");
  }
  function prepare() {
    if (ready) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) showMessage("播放暂不可用，请稍后再试。");
      });
    } else {
      video.src = source;
    }
    video.addEventListener("error", function () {
      showMessage("播放暂不可用，请稍后再试。");
    });
    ready = true;
  }
  function start() {
    prepare();
    video.controls = true;
    if (overlay) overlay.classList.add("is-hidden");
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        showMessage("点击播放按钮即可开始观看。");
      });
    }
  }
  if (overlay) overlay.addEventListener("click", start);
  document.querySelectorAll("[data-action='play']").forEach(function (button) {
    button.addEventListener("click", start);
  });
  window.addEventListener("pagehide", function () {
    if (hls) hls.destroy();
  });
}
