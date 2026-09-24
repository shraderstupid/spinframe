const input = document.querySelector('#videoInput');
const video = document.querySelector('#video');
const shell = document.querySelector('#videoShell');
const empty = document.querySelector('#emptyState');
const stagePlay = document.querySelector('#stagePlay');
const badge = document.querySelector('#rotationBadge');
const speed = document.querySelector('#speedRange');
const speedOutput = document.querySelector('#speedOutput');
const playButton = document.querySelector('#playButton');
const playIcon = document.querySelector('#playIcon');
const playText = document.querySelector('#playText');

let direction = 1;
let angle = 0;
let lastFrame = performance.now();
let objectUrl = null;

function setDirection(next) {
  direction = next;
  const clockwise = next === 1;
  document.querySelector('#clockwiseButton').classList.toggle('active', clockwise);
  document.querySelector('#counterButton').classList.toggle('active', !clockwise);
  document.querySelector('#clockwiseButton').setAttribute('aria-pressed', clockwise);
  document.querySelector('#counterButton').setAttribute('aria-pressed', !clockwise);
}

function updateSpeed() {
  speedOutput.value = `${speed.value}°/s`;
  speed.style.setProperty('--fill', `${speed.value / 1.8}%`);
}

function updatePlayUI() {
  const playing = !video.paused && !video.ended;
  playIcon.textContent = playing ? 'Ⅱ' : '▶';
  playText.textContent = playing ? 'Pause' : 'Play';
  stagePlay.classList.toggle('playing', playing);
  stagePlay.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
}

async function togglePlay() {
  if (!video.src) return input.click();
  if (video.paused) {
    try { await video.play(); } catch (_) { updatePlayUI(); }
  } else video.pause();
}

function loadVideo(file) {
  if (!file) return;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;
  video.load();
  empty.hidden = true;
  shell.hidden = false;
  stagePlay.hidden = false;
  badge.hidden = false;
  angle = 0;
  shell.style.transform = 'rotate(0deg)';
  badge.textContent = '0°';
  video.play().catch(() => updatePlayUI());
}

function animate(now) {
  const elapsed = Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;
  if (video.src && !video.paused) {
    angle = (angle + direction * Number(speed.value) * elapsed) % 360;
    shell.style.transform = `rotate(${angle}deg)`;
    badge.textContent = `${Math.round(angle)}°`;
  }
  requestAnimationFrame(animate);
}

input.addEventListener('change', () => loadVideo(input.files[0]));
speed.addEventListener('input', updateSpeed);
playButton.addEventListener('click', togglePlay);
stagePlay.addEventListener('click', togglePlay);
video.addEventListener('play', updatePlayUI);
video.addEventListener('pause', updatePlayUI);
video.addEventListener('click', togglePlay);
document.querySelector('#clockwiseButton').addEventListener('click', () => setDirection(1));
document.querySelector('#counterButton').addEventListener('click', () => setDirection(-1));
document.querySelector('#changeButton').addEventListener('click', () => input.click());
document.querySelector('#resetButton').addEventListener('click', () => {
  angle = 0; speed.value = 30; setDirection(1); updateSpeed();
  shell.style.transform = 'rotate(0deg)'; badge.textContent = '0°';
});
const dialog = document.querySelector('#tipsDialog');
document.querySelector('#infoButton').addEventListener('click', () => dialog.showModal());
document.querySelector('#closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
window.addEventListener('beforeunload', () => objectUrl && URL.revokeObjectURL(objectUrl));

updateSpeed();
requestAnimationFrame(animate);
