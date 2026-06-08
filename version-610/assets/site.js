(function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var siteNav = document.querySelector("[data-site-nav]");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      siteNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === index);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === index);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 6200);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
    var input = form.querySelector("[data-search-input]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (input) {
        input.dispatchEvent(new Event("input"));
      }
    });

    if (!input) {
      return;
    }

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

      cards.forEach(function (card) {
        var content = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword.length > 0 && content.indexOf(keyword) === -1);
      });
    });
  });
})();
