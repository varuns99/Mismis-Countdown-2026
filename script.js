const targetTime = new Date("2026-08-30T14:30:00+02:00").getTime();
const progressStartTime = new Date("2026-08-26T12:00:00+02:00").getTime();
const milestones = [
  { id: "run", time: progressStartTime, pointerAsset: "assets/mis-run-white.gif?v=2026082733" },
  { id: "pack", time: new Date("2026-08-29T08:30:00+02:00").getTime(), pointerAsset: "assets/packmis.gif?v=2026082811" },
  { id: "plane", time: new Date("2026-08-30T08:30:00+02:00").getTime(), pointerAsset: "assets/planemis.gif?v=2026082815" },
  { id: "bus", time: new Date("2026-08-30T12:30:00+02:00").getTime(), pointerAsset: "assets/busmis.gif" },
  { id: "arrival", time: targetTime, pointerText: "❤️" },
];

const elements = {
  countdown: document.querySelector(".countdown"),
  title: document.querySelector("#countdown-title"),
  timer: document.querySelector(".timer"),
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  status: document.querySelector("#status"),
  statusValue: document.querySelector("#status-value"),
  progressFill: document.querySelector("#progress-fill"),
  progressNeedle: document.querySelector("#progress-needle"),
  progressTrack: document.querySelector(".progress-track"),
  milestoneDots: document.querySelectorAll(".milestone"),
  heartRain: document.querySelector("#heart-rain"),
  tapFireworks: document.querySelector("#tap-fireworks"),
  backgroundMusic: document.querySelector("#background-music"),
  musicToggle: document.querySelector("#music-toggle"),
};

const units = {
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

let musicPausedByUser = false;
let lastTimerSparkle = 0;

function updateMusicToggle() {
  const isPlaying = !elements.backgroundMusic.paused;
  const label = isPlaying ? "Pause background music" : "Play background music";

  elements.musicToggle.textContent = isPlaying ? "🔊" : "🔈";
  elements.musicToggle.setAttribute("aria-label", label);
  elements.musicToggle.title = label;
}

function startMusic() {
  if (musicPausedByUser || !elements.backgroundMusic.paused) return;

  elements.backgroundMusic.play().catch(() => {
    updateMusicToggle();
  });
}

function toggleMusic() {
  if (elements.backgroundMusic.paused) {
    musicPausedByUser = false;
    startMusic();
    return;
  }

  musicPausedByUser = true;
  elements.backgroundMusic.pause();
}

elements.backgroundMusic.addEventListener("play", updateMusicToggle);
elements.backgroundMusic.addEventListener("pause", updateMusicToggle);
elements.musicToggle.addEventListener("click", toggleMusic);

function twoDigits(value) {
  return String(value).padStart(2, "0");
}

const drawnDigitOffsets = {
  0: "0.01em",
  1: "-0.01em",
  2: "0.02em",
  3: "0em",
  4: "0.015em",
  5: "-0.01em",
  6: "0.01em",
  7: "0.025em",
  8: "0em",
  9: "0.015em",
};

function renderDrawnDigits(element, value) {
  element.replaceChildren();
  element.classList.add("drawn-time");

  for (const digit of String(value)) {
    const glyph = document.createElement("img");
    glyph.className = "drawn-digit";
    glyph.src = `assets/digits/${digit}.png?v=rose2`;
    glyph.alt = digit;
    glyph.style.setProperty("--baseline-offset", drawnDigitOffsets[digit]);
    element.append(glyph);
  }
}

function pulseTimer() {
  if (!elements.timer.isConnected) return;

  elements.timer.classList.remove("timer-heartbeat");
  requestAnimationFrame(() => elements.timer.classList.add("timer-heartbeat"));
}

function releaseTimerSparkles(now) {
  if (now - lastTimerSparkle < 3600) return;
  lastTimerSparkle = now;

  const secondsBox = elements.seconds.getBoundingClientRect();
  const sparkles = ["·", "♡", "•", "♥"];
  const count = 1 + Math.floor(Math.random() * 2);

  for (let index = 0; index < count; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "timer-sparkle";
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    sparkle.style.left = `${secondsBox.left + secondsBox.width * (0.34 + Math.random() * 0.32)}px`;
    sparkle.style.top = `${secondsBox.top + secondsBox.height * (0.16 + Math.random() * 0.2)}px`;
    sparkle.style.fontSize = `${10 + Math.random() * 7}px`;
    sparkle.style.setProperty("--drift", `${-13 + Math.random() * 26}px`);
    sparkle.style.setProperty("--tilt", `${-18 + Math.random() * 36}deg`);
    sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
    document.body.append(sparkle);
  }
}

function journeyProgress(now) {
  if (now <= progressStartTime) return 0;
  if (now >= targetTime) return 100;

  for (let index = 0; index < milestones.length - 1; index += 1) {
    const current = milestones[index];
    const next = milestones[index + 1];

    if (now < next.time) {
      const segmentProgress = (now - current.time) / (next.time - current.time);
      return (index + segmentProgress) * 25;
    }
  }

  return 100;
}

function updateProgressNeedle(milestone) {
  if (elements.progressNeedle.dataset.milestone === milestone.id) return;

  elements.progressNeedle.replaceChildren();
  elements.progressNeedle.dataset.milestone = milestone.id;

  if (milestone.pointerText) {
    elements.progressNeedle.textContent = milestone.pointerText;
    return;
  }

  const animation = document.createElement("img");
  animation.className = "pointer-animation";
  animation.src = milestone.pointerAsset;
  animation.alt = "";
  elements.progressNeedle.append(animation);
}

function updateJourneyStatus(milestone) {
  const labels = {
    run: "Zagrebmiš 🇭🇷",
    pack: "Packmiš 🧳",
    plane: "Planemiš ✈",
    bus: "Busmiš 🚌",
    arrival: "Mišmiš 💕",
  };

  elements.statusValue.textContent = labels[milestone.id];
}

function startHeartRain() {
  if (elements.heartRain.childElementCount) return;

  const heartShapes = ["♡", "♥", "❣", "❥", "♡", "♥", "♡", "❣"];
  const positions = [2, 9, 17, 24, 32, 38, 47, 55, 61, 69, 76, 83, 91, 6, 14, 29, 43, 52, 65, 73, 87, 96, 20, 35, 58, 79];
  const colors = ["#d93f61", "#ee8faa", "#b84b68", "#f2a3b9", "#c95a75"];
  const sizes = ["0.86rem", "1.18rem", "1.38rem", "0.98rem", "1.5rem", "1.08rem"];
  const drifts = [-38, 29, -24, 42, -31, 24, 35, -45];
  const sways = [18, -26, 32, -18, 22, -34, 28, -20];
  const tilts = [-20, 14, -12, 23, -16, 18, -24, 10];
  const fragment = document.createDocumentFragment();

  positions.forEach((position, index) => {
    const drop = document.createElement("span");
    drop.className = "falling-heart";
    drop.textContent = heartShapes[index % heartShapes.length];
    drop.style.setProperty("--left", `${position}%`);
    drop.style.setProperty("--delay", `${-((index * 1.37) % 13)}s`);
    drop.style.setProperty("--duration", `${7.5 + ((index * 1.9) % 5.5)}s`);
    drop.style.setProperty("--drift", `${drifts[index % drifts.length]}px`);
    drop.style.setProperty("--sway", `${sways[index % sways.length]}px`);
    drop.style.setProperty("--tilt", `${tilts[index % tilts.length]}deg`);
    drop.style.setProperty("--heart-size", sizes[index % sizes.length]);
    drop.style.setProperty("--heart-color", colors[index % colors.length]);
    fragment.append(drop);
  });

  elements.heartRain.append(fragment);
  elements.heartRain.classList.add("is-active");
}

function fireworkAt(x, y) {
  const heartShapes = ["♡", "♥", "❣", "❥"];
  const colors = ["#d93f61", "#ee8faa", "#b84b68", "#f2a3b9", "#f4b740", "#78b8a0"];
  const fragment = document.createDocumentFragment();
  const isComplete = elements.countdown.classList.contains("is-complete");

  if (!isComplete) {
    const bubbleCount = 4 + Math.floor(Math.random() * 3);

    for (let index = 0; index < bubbleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / bubbleCount + (Math.random() - 0.5) * 0.8;
      const distance = 12 + Math.random() * 34;
      const bubble = document.createElement("span");

      bubble.className = "tap-particle tap-emoji tap-pleading-bubble";
      bubble.textContent = "🥺";
      bubble.style.setProperty("--origin-x", `${x}px`);
      bubble.style.setProperty("--origin-y", `${y}px`);
      bubble.style.setProperty("--bubble-x", `${Math.cos(angle) * distance}px`);
      bubble.style.setProperty("--bubble-y", `${Math.sin(angle) * distance - 26}px`);
      bubble.style.setProperty("--delay", `${Math.random() * 90}ms`);
      bubble.style.setProperty("--size", `${11 + Math.random() * 5}px`);
      bubble.addEventListener("animationend", () => bubble.remove(), { once: true });
      fragment.append(bubble);
    }

    elements.tapFireworks.append(fragment);
    return;
  }

  const particleCount = 26;

  for (let index = 0; index < particleCount; index += 1) {
    const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.22;
    const distance = 42 + Math.random() * 86;
    const particle = document.createElement("span");
    const isEmoji = index % 8 === 0;
    const isHeart = !isEmoji && index % 3 === 0;

    particle.className = isEmoji
      ? "tap-particle tap-emoji"
      : isHeart
        ? "tap-particle tap-heart"
        : "tap-particle tap-confetti";
    if (isEmoji) particle.textContent = "🥹";
    if (isHeart) particle.textContent = heartShapes[index % heartShapes.length];
    particle.style.setProperty("--origin-x", `${x}px`);
    particle.style.setProperty("--origin-y", `${y}px`);
    particle.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--burst-y", `${Math.sin(angle) * distance - 22}px`);
    particle.style.setProperty("--spin", `${Math.round((Math.random() - 0.5) * 540)}deg`);
    particle.style.setProperty("--color", colors[index % colors.length]);
    particle.style.setProperty("--delay", `${Math.random() * 70}ms`);
    particle.style.setProperty("--size", `${7 + Math.random() * 7}px`);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
    fragment.append(particle);
  }

  elements.tapFireworks.append(fragment);
}

document.addEventListener("pointerdown", (event) => {
  if (event.button && event.button !== 0) return;
  if (event.target.closest("#music-toggle")) return;
  startMusic();
  fireworkAt(event.clientX, event.clientY);
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#music-toggle")) return;
  startMusic();
});

updateMusicToggle();

function completeCountdown() {
  if (elements.countdown.classList.contains("is-complete")) return;

  elements.countdown.classList.add("is-complete");
  elements.title.textContent = "Miš meets Miš now ❤️";
  elements.timer.replaceWith(elements.status);
  startHeartRain();
}

function updateCountdown() {
  const now = Date.now();
  const remaining = targetTime - now;
  const progress = journeyProgress(now);
  const currentMilestone = milestones.reduce(
    (current, milestone) => (now >= milestone.time ? milestone : current),
    milestones[0],
  );

  elements.progressTrack.style.setProperty("--progress", `${progress}%`);
  elements.progressFill.style.setProperty("--progress", `${progress}%`);
  elements.progressNeedle.style.setProperty("--progress", `${progress}%`);
  updateProgressNeedle(currentMilestone);
  updateJourneyStatus(currentMilestone);
  elements.milestoneDots.forEach((dot, index) => {
    dot.classList.toggle("is-passed", now >= milestones[index].time);
  });

  if (remaining <= 0) {
    completeCountdown();
    return;
  }

  const days = Math.floor(remaining / units.day);
  const hours = Math.floor((remaining % units.day) / units.hour);
  const minutes = Math.floor((remaining % units.hour) / units.minute);
  const seconds = Math.floor((remaining % units.minute) / units.second);

  renderDrawnDigits(elements.days, String(days));
  renderDrawnDigits(elements.hours, twoDigits(hours));
  renderDrawnDigits(elements.minutes, twoDigits(minutes));
  renderDrawnDigits(elements.seconds, twoDigits(seconds));
  pulseTimer();
  releaseTimerSparkles(now);
}

updateCountdown();
setInterval(updateCountdown, 1000);
