(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function init(source) {
        ready(function () {
            var video = document.querySelector('[data-player-video]');
            var cover = document.querySelector('[data-player-cover]');
            var button = document.querySelector('[data-player-button]');
            var started = false;
            var hls = null;

            if (!video || !source) {
                return;
            }

            function begin() {
                if (started) {
                    video.play().catch(function () {});
                    return;
                }

                started = true;
                video.controls = true;

                if (cover) {
                    cover.classList.add('hide');
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {});
                    return;
                }

                loadHls(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.src = source;
                        video.play().catch(function () {});
                    }
                });
            }

            if (cover) {
                cover.addEventListener('click', begin);
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    begin();
                });
            }

            video.addEventListener('click', begin);

            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    window.StaticPlayer = {
        init: init
    };
})();
