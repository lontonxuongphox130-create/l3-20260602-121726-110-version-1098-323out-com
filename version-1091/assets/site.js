(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var searchForm = document.querySelector('[data-search-form]');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = searchForm.querySelector('[data-site-search]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = 'ranking.html?q=' + encodeURIComponent(query);
      }
    });
  }

  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
  grids.forEach(function (grid) {
    var scope = grid.closest('main') || document;
    var input = scope.querySelector('[data-grid-search]');
    var yearButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]'));
    var genreButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-genre]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var activeYear = '';
    var activeGenre = '';

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.innerText || ''
        ].join(' ').toLowerCase();
        var yearOk = !activeYear || (card.getAttribute('data-year') || '') === activeYear;
        var genreOk = !activeGenre || haystack.indexOf(activeGenre.toLowerCase()) !== -1;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !(yearOk && genreOk && keywordOk));
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || '';
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        filterCards();
      });
    });

    genreButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeGenre = button.getAttribute('data-filter-genre') || '';
        genreButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        filterCards();
      });
    });

    filterCards();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;

    function loadVideo() {
      if (!video || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        }
      } else {
        video.src = stream;
      }
    }

    function startVideo() {
      loadVideo();
      shell.classList.add('playing');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
    }
  });
})();
