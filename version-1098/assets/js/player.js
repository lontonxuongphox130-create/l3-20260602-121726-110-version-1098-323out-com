(function () {
  function setupPlayer(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    var cover = root.querySelector('[data-play-cover]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var ready = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('controls', 'controls');
      ready = true;
    }

    function playVideo() {
      attachStream();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (!ready) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
