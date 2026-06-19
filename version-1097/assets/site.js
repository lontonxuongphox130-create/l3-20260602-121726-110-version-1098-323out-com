(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
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

    function play() {
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

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupLocalFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-local-filter]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var grid = document.querySelector('[data-card-grid]');
      var empty = document.querySelector('[data-empty-state]');

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var regions = [];
      var types = [];

      cards.forEach(function (card) {
        var region = card.getAttribute('data-region') || '';
        var type = card.getAttribute('data-type') || '';
        if (region && regions.indexOf(region) === -1) {
          regions.push(region);
        }
        if (type && types.indexOf(type) === -1) {
          types.push(type);
        }
      });

      regions.sort().forEach(function (region) {
        var option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
      });

      types.sort().forEach(function (type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && card.getAttribute('data-region') !== region) {
            matched = false;
          }
          if (type && card.getAttribute('data-type') !== type) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (regionSelect) {
        regionSelect.addEventListener('change', applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', applyFilter);
      }
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = page.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
    var empty = page.querySelector('[data-empty-state]');

    if (input) {
      input.value = keyword;
    }

    function filter(value) {
      var query = value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        filter(input.value);
      });
    }
    filter(keyword);
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var playButton = document.querySelector('[data-play-button]');
    var muteButton = document.querySelector('[data-mute-button]');
    var fullscreenButton = document.querySelector('[data-fullscreen-button]');
    var hlsInstance = null;

    function attachSource() {
      if (!source || video.getAttribute('data-ready') === 'true') {
        return;
      }

      video.setAttribute('data-ready', 'true');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            video.src = source;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function togglePlay() {
      attachSource();
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    function syncPlayButton() {
      if (playButton) {
        playButton.textContent = video.paused ? '▶' : '❚❚';
      }
    }

    attachSource();

    if (playButton) {
      playButton.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', syncPlayButton);
    video.addEventListener('pause', syncPlayButton);

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '×' : '♪';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        var container = video.closest('.player-shell') || video;
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      });
    }
  }

  function setupImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayer();
    setupImageFallback();
  });
})();
