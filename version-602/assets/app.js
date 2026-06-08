document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let heroIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  document.querySelectorAll(".catalog-scope").forEach(function (scope) {
    const search = scope.querySelector(".js-search");
    const type = scope.querySelector(".js-filter-type");
    const year = scope.querySelector(".js-filter-year");
    const cards = Array.from(scope.querySelectorAll(".movie-card"));

    function applyFilters() {
      const keyword = search ? search.value.trim().toLowerCase() : "";
      const typeValue = type ? type.value : "";
      const yearValue = year ? year.value : "";

      cards.forEach(function (card) {
        const haystack = (card.getAttribute("data-search") || "").toLowerCase();
        const cardType = card.getAttribute("data-type") || "";
        const cardYear = card.getAttribute("data-year") || "";
        const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchedType = !typeValue || cardType === typeValue;
        const matchedYear = !yearValue || cardYear === yearValue;
        card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedType && matchedYear));
      });
    }

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    if (type) {
      type.addEventListener("change", applyFilters);
    }

    if (year) {
      year.addEventListener("change", applyFilters);
    }
  });
});
