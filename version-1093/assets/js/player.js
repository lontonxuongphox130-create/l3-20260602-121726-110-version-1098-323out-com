(function() {
    function startPlayer(shell) {
        var video = shell.querySelector(".js-movie-video");
        var button = shell.querySelector(".js-play-button");

        if (!video || !button) {
            return;
        }

        var src = button.getAttribute("data-hls");

        if (!src) {
            return;
        }

        function begin() {
            if (button) {
                button.classList.add("is-hidden");
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {});
            }
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.getAttribute("src") !== src) {
                video.src = src;
            }

            begin();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(src);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            }

            video.addEventListener("canplay", begin, { once: true });
            begin();
            return;
        }

        video.src = src;
        begin();
    }

    var shells = Array.prototype.slice.call(document.querySelectorAll(".js-video-shell"));

    shells.forEach(function(shell) {
        var button = shell.querySelector(".js-play-button");
        var video = shell.querySelector(".js-movie-video");

        if (button) {
            button.addEventListener("click", function() {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener("click", function() {
                if (video.paused) {
                    startPlayer(shell);
                }
            });
        }
    });
})();
