(function () {
  const navButton = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startTimer();
      });
    }

    show(0);
    startTimer();
  });

  function applyFilter(input) {
    const targetId = input.getAttribute('data-filter-target');
    const grid = document.getElementById(targetId);
    if (!grid) {
      return;
    }
    const keyword = input.value.trim().toLowerCase();
    Array.from(grid.querySelectorAll('.movie-card')).forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.textContent
      ].join(' ').toLowerCase();
      card.classList.toggle('hidden-card', keyword && !haystack.includes(keyword));
    });
  }

  document.querySelectorAll('.client-filter').forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input);
    });
  });

  document.querySelectorAll('.client-sort').forEach(function (select) {
    select.addEventListener('change', function () {
      const grid = document.getElementById(select.getAttribute('data-sort-target'));
      if (!grid) {
        return;
      }
      const cards = Array.from(grid.querySelectorAll('.movie-card'));
      const mode = select.value;
      cards.sort(function (a, b) {
        if (mode === 'year-desc') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === 'year-asc') {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (mode === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }
        return 0;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  });

  const searchInput = document.getElementById('page-search-input');
  const searchGrid = document.getElementById('search-grid');
  if (searchInput && searchGrid) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    searchInput.value = q;
    const applySearch = function () {
      const keyword = searchInput.value.trim().toLowerCase();
      Array.from(searchGrid.querySelectorAll('.movie-card')).forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', keyword && !haystack.includes(keyword));
      });
    };
    searchInput.addEventListener('input', applySearch);
    applySearch();
  }
}());
