(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector("video[data-stream]");
    var button = shell.querySelector("[data-play-button]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var prepared = false;

    if (!video || !stream) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        shell.hlsPlayer = hls;
        return;
      }

      video.src = stream;
    }

    function play() {
      prepare();
      shell.classList.add("is-playing");
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.currentTime) {
        shell.classList.remove("is-playing");
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
})();
