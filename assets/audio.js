const audio = document.getElementById("bg-music");
const toggleBtn = document.getElementById("audio-toggle");

audio.volume = 0.35; // Keep background music soft (0.0 to 1.0)

function updateUI(isPlaying) {
  if (isPlaying) {
    toggleBtn.textContent = "♪ Playing";
    toggleBtn.classList.add("playing");
  } else {
    toggleBtn.textContent = "♪ Play Music";
    toggleBtn.classList.remove("playing");
  }
}

function startAudio() {
  audio
    .play()
    .then(() => {
      updateUI(true);
      document.removeEventListener("click", unlockAudio);
    })
    .catch(() => {
      updateUI(false);
    });
}

function unlockAudio(e) {
  if (e.target === toggleBtn) return;
  startAudio();
}

startAudio();

document.addEventListener("click", unlockAudio);

toggleBtn.addEventListener("click", () => {
  if (audio.paused) {
    startAudio();
  } else {
    audio.pause();
    updateUI(false);
    document.removeEventListener("click", unlockAudio);
  }
});
