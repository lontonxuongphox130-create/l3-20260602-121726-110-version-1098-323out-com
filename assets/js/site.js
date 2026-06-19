(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5800);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var queryFill = document.querySelector('[data-query-fill]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = '';

  if (queryFill) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      queryFill.value = query;
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var filter = normalize(activeFilter);

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedFilter = !filter || text.indexOf(filter) !== -1;
      card.classList.toggle('is-hidden', !(matchedKeyword && matchedFilter));
    });
  }

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', applyFilters);
    applyFilters();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });
})();
