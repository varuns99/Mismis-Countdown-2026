const targetTime = new Date("2026-08-30T14:30:00+02:00").getTime();
const progressStartTime = new Date("2026-08-26T12:00:00+02:00").getTime();
const milestones = [
  { time: progressStartTime, icon: "🐭🇭🇷" },
  { time: new Date("2026-08-29T08:30:00+02:00").getTime(), icon: "🐭🧳" },
  { time: new Date("2026-08-30T08:30:00+02:00").getTime(), icon: "🐭✈" },
  { time: new Date("2026-08-30T12:30:00+02:00").getTime(), icon: "🚌🐭" },
  { time: targetTime, icon: "🐭❤️🐭", pointerIcon: "❤️" },
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
  progressFill: document.querySelector("#progress-fill"),
  progressNeedle: document.querySelector("#progress-needle"),
  progressTrack: document.querySelector(".progress-track"),
  milestoneDots: document.querySelectorAll(".milestone"),
  heartRain: document.querySelector("#heart-rain"),
};

const units = {
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

function twoDigits(value) {
  return String(value).padStart(2, "0");
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

function startHeartRain() {
  if (elements.heartRain.childElementCount) return;

  const hearts = ["♡", "♥", "♡", "♥", "♡", "♥", "♡", "♥", "♡", "♥", "♡", "♥"];
  const colors = ["#d93f61", "#ee8faa", "#b84b68", "#f2a3b9"];
  const fragment = document.createDocumentFragment();

  hearts.forEach((heart, index) => {
    const drop = document.createElement("span");
    drop.className = "falling-heart";
    drop.textContent = heart;
    drop.style.setProperty("--left", `${(index * 8.7 + 3) % 96}%`);
    drop.style.setProperty("--delay", `${-(index * 0.9)}s`);
    drop.style.setProperty("--duration", `${8 + (index % 5)}s`);
    drop.style.setProperty("--drift", `${index % 2 ? 34 : -30}px`);
    drop.style.setProperty("--tilt", `${index % 2 ? 18 : -14}deg`);
    drop.style.setProperty("--heart-color", colors[index % colors.length]);
    fragment.append(drop);
  });

  elements.heartRain.append(fragment);
  elements.heartRain.classList.add("is-active");
}

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
  elements.progressNeedle.textContent = currentMilestone.pointerIcon || currentMilestone.icon;
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

  elements.days.textContent = String(days);
  elements.hours.textContent = twoDigits(hours);
  elements.minutes.textContent = twoDigits(minutes);
  elements.seconds.textContent = twoDigits(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);
