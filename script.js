document.addEventListener("DOMContentLoaded", function () {
  let currentIndex = 0;
  let currentTitleAudio = null;
  let currentCaptionAudio = null;
  let captionRepeatTimeout = null;
  let titleNextPlayTimeout = null;
  let firstTimeRunning = true;
  let volumeOn = true;
  const volumeOnImage = "./res/volume-on.png";
  const volumeOffImage = "./res/volume-off.png";

  function updateStatus() {
    if (volumeOn) document.getElementById("volumeIcon").src = volumeOnImage;
    else document.getElementById("volumeIcon").src = volumeOffImage;
  }

  function clearCaptionRepeatTimeout() {
    // Hủy bất kỳ lệnh setTimeout nào đang tồn tại
    if (captionRepeatTimeout) {
      // console.log("clear caption Repeat Timeout");
      clearTimeout(captionRepeatTimeout);
      captionRepeatTimeout = null;
    }
    if (titleNextPlayTimeout) {
      // console.log("clear caption Repeat Timeout");
      clearTimeout(titleNextPlayTimeout);
      titleNextPlayTimeout = null;
    }
  }

  function updateImage(index) {
    // Dừng âm thanh hiện tại nếu có
    clearCaptionRepeatTimeout();
    if (currentTitleAudio) {
      currentTitleAudio.pause();
      currentTitleAudio.currentTime = 0; // Quay lại đầu file âm thanh
      currentTitleAudio = null;
    }
    if (currentCaptionAudio) {
      currentCaptionAudio.pause();
      currentCaptionAudio.currentTime = 0; // Quay lại đầu file âm thanh
      currentCaptionAudio = null;
    }
    // Load du lieu cua tam hinh hien tai
    const image = images[index];
    document.getElementById("current-image").src = "./res/images/" + image.src;
    playAudio("./res/audios/" + image.title, "./res/audios/" + image.caption);
  }

  function playAudio(titleAudioSrc, captionAudioSrc) {
    // Dừng và đặt lại các âm thanh hiện tại nếu chúng đang phát
    if (currentTitleAudio) {
      currentTitleAudio.pause();
      currentTitleAudio.currentTime = 0;
      currentTitleAudio = null;
    }

    if (currentCaptionAudio) {
      currentCaptionAudio.pause();
      currentCaptionAudio.currentTime = 0;
      currentCaptionAudio = null;
    }

    clearCaptionRepeatTimeout();

    let titleAudioIsNull = false;
    let captionAudioIsNull = false;

    currentTitleAudio = new Audio(titleAudioSrc);
    currentCaptionAudio = new Audio(captionAudioSrc);

    currentTitleAudio.onerror = (e) => {
      titleAudioIsNull = true;
      console.error("Failed to load title audio: ", titleAudioSrc, e);
      currentTitleAudio = new Audio("./res/audios/mute.mp3");
    };
    currentCaptionAudio.onerror = (e) => {
      captionAudioIsNull = true;
      console.error("Failed to load caption audio: ", captionAudioSrc, e);
      currentCaptionAudio = new Audio("./res/audios/mute.mp3");
    };

    let delayAfterTitle = 1000;
    let delayBetweenCaptions = 500;

    if (!firstTimeRunning) {
      if (volumeOn) {
        if (!titleAudioIsNull) currentTitleAudio.play();
        if (!captionAudioIsNull)
          currentTitleAudio.onended = () => {
            titleNextPlayTimeout = setTimeout(() => {
              playCaptionInLoop(delayBetweenCaptions);
            }, delayAfterTitle);
          };
      }
    } else firstTimeRunning = false;
  }

  function playCaptionInLoop(delayBetweenCaptions) {
    if (volumeOn) {
      currentCaptionAudio.play();
      currentCaptionAudio.onended = () => {
        captionRepeatTimeout = setTimeout(() => {
          currentCaptionAudio.currentTime = 0;
          if (volumeOn) currentCaptionAudio.play();
        }, delayBetweenCaptions);
      };
    }
  }

  // Các hàm playAudio và playCaptionInLoop sẽ lấy giá trị từ các span thay vì input

  document.getElementById("prev-button").addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateImage(currentIndex);
    }
  });

  document.getElementById("next-button").addEventListener("click", function () {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      updateImage(currentIndex);
    }
  });

  document
    .getElementById("image-container")
    .addEventListener("click", function () {
      if (currentIndex < images.length - 1) {
        currentIndex++;
        updateImage(currentIndex);
      }
    });

  document.getElementById("volume").addEventListener("click", function () {
    volumeOn = !volumeOn;
    updateStatus();
    if (!volumeOn) {
      if (currentTitleAudio && !currentTitleAudio.paused) {
        currentTitleAudio.pause();
        currentTitleAudio.currentTime = 0;
      }
      if (currentCaptionAudio && !currentCaptionAudio.paused) {
        currentCaptionAudio.pause();
        currentCaptionAudio.currentTime = 0;
        clearCaptionRepeatTimeout();
      }
    } else {
      updateImage(currentIndex);
    }
  });

  updateImage(0);
});
