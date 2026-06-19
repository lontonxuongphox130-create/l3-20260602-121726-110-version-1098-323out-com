(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || '0'));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var year = qs('[data-filter-year]', scope);
      var sort = qs('[data-sort-select]', scope);
      var list = qs('[data-card-list]') || scope.nextElementSibling;
      var cards = list ? qsa('[data-title]', list) : [];

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
          card.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchYear));
        });
        sortCards();
      }

      function sortCards() {
        if (!sort || !list) {
          return;
        }
        var value = sort.value;
        var visibleCards = qsa('[data-title]', list);
        visibleCards.sort(function (a, b) {
          if (value === 'title-asc') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          }
          if (value === 'heat-desc') {
            return Number(b.getAttribute('data-heat') || 0) - Number(a.getAttribute('data-heat') || 0);
          }
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
        visibleCards.forEach(function (card) {
          list.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (sort) {
        sort.addEventListener('change', apply);
      }
    });
  }

  function setupPlayer() {
    qsa('[data-player-shell]').forEach(function (shell) {
      var video = qs('video[data-hls]', shell);
      var button = qs('[data-play-button]', shell);
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-hls');
      var ready = false;

      function init() {
        if (ready || !source) {
          return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        }
      }

      function play() {
        init();
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', init, { once: true });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    });
  }

  function setupSearchPage() {
    var form = qs('[data-search-form]');
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    if (!form || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = qs('input[name="q"]', form);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function card(item) {
      var tags = (item.tags || item.genre || '').split(/[,，、\/\s]+/).filter(Boolean).slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card compact-card">' +
        '<a class="poster-wrap" href="' + item.url + '">' +
        '<img src="./' + item.image + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-year">' + escapeHtml(String(item.year || '')) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="card-meta"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.region) + '</span></div>' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.desc) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function run(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        status.textContent = '输入关键词后显示匹配结果。';
        return;
      }
      var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var text = [item.title, item.genre, item.tags, item.region, item.year, item.category, item.desc].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 80);
      results.innerHTML = matched.map(card).join('');
      status.textContent = '找到 ' + matched.length + ' 条匹配结果。';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      run(input.value);
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      window.history.replaceState(null, '', url.toString());
    });
    input.addEventListener('input', function () {
      run(input.value);
    });
    if (initialQuery) {
      run(initialQuery);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
