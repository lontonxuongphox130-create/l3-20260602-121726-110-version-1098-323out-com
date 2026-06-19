(function () {
  var menuButton = document.querySelector('.menu-button');
  var navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
  var searchableCards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function applyFilter(value) {
    var query = normalize(value);
    searchableCards.forEach(function (card) {
      card.classList.toggle('is-hidden', query && cardText(card).indexOf(query) === -1);
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q');

  if (initialQuery && filterInputs.length) {
    filterInputs.forEach(function (input) {
      input.value = initialQuery;
    });
    applyFilter(initialQuery);
  }

  Array.prototype.slice.call(document.querySelectorAll('.filter-chip')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      var value = chip.getAttribute('data-chip') || chip.textContent;
      filterInputs.forEach(function (input) {
        input.value = value;
      });
      applyFilter(value);
    });
  });

  function initializeVideo(video) {
    var stream = video.getAttribute('data-stream');
    var box = video.closest('.player-box');
    var cover = box ? box.querySelector('.player-cover') : null;
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startVideo() {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (!attached) {
        startVideo();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initializeVideo);
})();
