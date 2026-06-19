(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showHero(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showHero(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(index - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(index + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartHero();
      });
    });

    restartHero();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var list = document.querySelector('[data-filter-list]');

  if (filterInput && list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && filterInput.hasAttribute('data-sync-query')) {
      filterInput.value = q;
    }

    function applyFilter() {
      var keyword = filterInput.value.trim().toLowerCase();
      var year = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var yearOk = !year || card.getAttribute('data-year') === year;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-filter-hidden', !(yearOk && keywordOk));
      });
    }

    filterInput.addEventListener('input', applyFilter);

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  }
})();

function initPlayer(url) {
  var video = document.getElementById('movie-video');
  var cover = document.getElementById('play-cover');
  var hls = null;
  var ready = false;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      ready = true;
    } else {
      video.src = url;
      ready = true;
    }
  }

  function playVideo() {
    attach();
    video.controls = true;

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (cover && video.currentTime === 0) {
      cover.classList.remove('is-hidden');
    }
  });
}
