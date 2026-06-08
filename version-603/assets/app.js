(function () {
  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSliders() {
    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (slides.length === 0) {
        return;
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    if (!input) {
      return;
    }
    var items = Array.prototype.slice.call(document.querySelectorAll(".filter-item"));
    var empty = document.querySelector("[data-empty-message]");

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var text = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-tags") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-type") || ""
        ].join(" ").toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        item.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", apply);
    apply();
  }

  function setupSorters() {
    var select = document.querySelector("[data-sort-select]");
    if (!select) {
      return;
    }
    var grid = document.querySelector("[data-sort-grid]");
    if (!grid) {
      return;
    }

    function valueNumber(item, attr) {
      var value = parseFloat(item.getAttribute(attr) || "0");
      return Number.isFinite(value) ? value : 0;
    }

    function applySort() {
      var items = Array.prototype.slice.call(grid.querySelectorAll(".filter-item"));
      var mode = select.value;
      items.sort(function (a, b) {
        if (mode === "heat-desc") {
          return valueNumber(b, "data-heat") - valueNumber(a, "data-heat");
        }
        if (mode === "title-asc") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        return valueNumber(b, "data-year") - valueNumber(a, "data-year");
      });
      items.forEach(function (item) {
        grid.appendChild(item);
      });
    }

    select.addEventListener("change", applySort);
    applySort();
  }

  function setupCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (box) {
      var track = box.querySelector(".carousel-track");
      var prev = box.querySelector("[data-carousel-prev]");
      var next = box.querySelector("[data-carousel-next]");
      var step = 294;
      var index = 0;

      if (!track) {
        return;
      }

      function maxIndex() {
        return Math.max(0, track.children.length - Math.max(1, Math.floor(box.clientWidth / step)));
      }

      function move() {
        var max = maxIndex();
        index = Math.min(Math.max(index, 0), max);
        track.style.transform = "translateX(" + (-index * step) + "px)";
      }

      if (prev) {
        prev.addEventListener("click", function () {
          index -= 1;
          move();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          index += 1;
          if (index > maxIndex()) {
            index = 0;
          }
          move();
        });
      }

      window.addEventListener("resize", move);
      move();
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;

    if (!video || !sourceUrl) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", play);
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHeroSliders();
    setupFilters();
    setupSorters();
    setupCarousels();
  });
})();
