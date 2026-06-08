(function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var filterBar = document.querySelector("[data-filter-bar]");

  if (filterBar) {
    var input = filterBar.querySelector("[data-filter-input]");
    var region = filterBar.querySelector("[data-filter-region]");
    var type = filterBar.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var empty = document.createElement("div");
    empty.className = "filter-empty";
    empty.textContent = "没有找到匹配的影片。";
    filterBar.parentNode.insertBefore(empty, filterBar.nextSibling);

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      empty.style.display = visible ? "none" : "block";
    }

    [input, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });
  }

  var player = document.querySelector("[data-player-video]");

  if (player) {
    var trigger = document.querySelector("[data-play-trigger]");
    var message = document.querySelector("[data-player-message]");
    var stream = player.getAttribute("data-stream");
    var started = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add("is-visible");
      }
    }

    function hideTrigger() {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    }

    function startPlayer() {
      if (!stream) {
        showMessage("暂时无法播放，请稍后再试。");
        return;
      }

      if (started) {
        player.play().catch(function () {});
        hideTrigger();
        return;
      }

      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(player);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          player.play().then(hideTrigger).catch(function () {
            hideTrigger();
          });
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("暂时无法播放，请稍后再试。");
          }
        });
      } else if (player.canPlayType("application/vnd.apple.mpegurl")) {
        player.src = stream;
        player.addEventListener("loadedmetadata", function () {
          player.play().then(hideTrigger).catch(function () {
            hideTrigger();
          });
        }, { once: true });
      } else {
        showMessage("暂时无法播放，请稍后再试。");
      }
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayer);
    }

    player.addEventListener("play", hideTrigger);
    player.addEventListener("click", function () {
      if (!started) {
        startPlayer();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  var searchMount = document.querySelector("[data-search-results]");

  if (searchMount && typeof SiteCatalog !== "undefined") {
    var searchInput = document.querySelector("[data-catalog-search]");
    var searchButton = document.querySelector("[data-catalog-submit]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function imagePath(item) {
      return "./" + item.cover + ".jpg";
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[character];
      });
    }

    function renderCard(item) {
      return [
        "<a class=\"movie-card\" href=\"" + escapeHtml(item.url) + "\">",
        "  <span class=\"movie-poster\">",
        "    <img src=\"" + escapeHtml(imagePath(item)) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" onerror=\"this.remove()\">",
        "    <span class=\"movie-play\">▶</span>",
        "  </span>",
        "  <span class=\"movie-info\">",
        "    <strong>" + escapeHtml(item.title) + "</strong>",
        "    <em>" + escapeHtml(item.region) + " · " + escapeHtml(item.kind) + " · " + escapeHtml(item.year) + "</em>",
        "    <span>" + escapeHtml(item.oneLine) + "</span>",
        "  </span>",
        "</a>"
      ].join("");
    }

    function renderSearch() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var results = SiteCatalog.filter(function (item) {
        if (!query) {
          return true;
        }
        return item.search.indexOf(query) !== -1;
      }).slice(0, 120);

      searchMount.innerHTML = results.map(renderCard).join("");

      if (!results.length) {
        searchMount.innerHTML = "<div class=\"filter-empty\" style=\"display:block\">没有找到匹配的影片。</div>";
      }
    }

    if (searchButton) {
      searchButton.addEventListener("click", function () {
        renderSearch();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", renderSearch);
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          renderSearch();
        }
      });
    }

    renderSearch();
  }
})();
