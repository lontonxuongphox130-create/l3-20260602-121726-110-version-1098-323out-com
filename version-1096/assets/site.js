(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterKeyword = document.querySelector('[data-filter-keyword]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterType = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));

  function cardMatchesYear(card, yearValue) {
    if (!yearValue) {
      return true;
    }

    var year = parseInt(card.getAttribute('data-year') || '0', 10);

    if (yearValue === 'older') {
      return year > 0 && year < 2000;
    }

    if (yearValue === '2010') {
      return year >= 2010 && year < 2020;
    }

    if (yearValue === '2000') {
      return year >= 2000 && year < 2010;
    }

    return String(year) === yearValue;
  }

  function applyFilters() {
    var keyword = filterKeyword ? filterKeyword.value.trim().toLowerCase() : '';
    var yearValue = filterYear ? filterYear.value : '';
    var typeValue = filterType ? filterType.value : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();

      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      var yearOk = cardMatchesYear(card, yearValue);
      var typeOk = !typeValue || haystack.indexOf(typeValue.toLowerCase()) !== -1;

      card.style.display = keywordOk && yearOk && typeOk ? '' : 'none';
    });
  }

  [filterKeyword, filterYear, filterType].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  function startVideo(stage) {
    var video = stage.querySelector('video');
    var cover = stage.querySelector('.player-poster');
    var src = video ? video.getAttribute('data-src') : '';

    if (!video || !src) {
      return;
    }

    if (cover) {
      cover.classList.add('hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = src;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hlsReady = true;
        video._hlsInstance = hls;
      }
      video.play().catch(function () {});
      return;
    }

    if (!video.src) {
      video.src = src;
    }
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-stage')).forEach(function (stage) {
    var cover = stage.querySelector('.player-poster');
    var video = stage.querySelector('video');

    if (cover) {
      cover.addEventListener('click', function () {
        startVideo(stage);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo(stage);
        } else {
          video.pause();
        }
      });
    }
  });

  var searchRoot = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-site-search-input]');
  var searchForm = document.querySelector('[data-site-search-form]');

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <a class="poster" href="' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <b>' + escapeHtml(movie.year) + '</b>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch(query) {
    if (!searchRoot || !window.SEARCH_MOVIES) {
      return;
    }

    var q = (query || '').trim().toLowerCase();

    if (searchInput) {
      searchInput.value = query || '';
    }

    if (!q) {
      searchRoot.innerHTML = '<div class="empty-state">输入影片标题、地区、年份或题材后开始浏览。</div>';
      return;
    }

    var results = window.SEARCH_MOVIES.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')]
        .join(' ')
        .toLowerCase()
        .indexOf(q) !== -1;
    }).slice(0, 120);

    if (!results.length) {
      searchRoot.innerHTML = '<div class="empty-state">没有匹配到影片，可以尝试更短的关键词。</div>';
      return;
    }

    searchRoot.innerHTML = results.map(movieCardTemplate).join('');
  }

  if (searchRoot) {
    var params = new URLSearchParams(window.location.search);
    renderSearch(params.get('q') || '');
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(searchInput ? searchInput.value : '');
    });
  }
})();
