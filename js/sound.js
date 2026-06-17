const MUTED_KEY = "lexis_sound_muted";

let audioCtx = null;

function getCtx() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, duration, type = "sine", volume = 0.3) {
  if (isMuted()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function isMuted() {
  return localStorage.getItem(MUTED_KEY) === "true";
}

export function setMuted(muted) {
  localStorage.setItem(MUTED_KEY, muted ? "true" : "false");
}

export function ensureAudioContext() {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
}

export function playCorrect() {
  if (isMuted()) return;
  playTone(523, 0.15, "sine", 0.25);
  setTimeout(() => playTone(659, 0.2, "sine", 0.25), 100);
}

export function playIncorrect() {
  playTone(200, 0.3, "triangle", 0.15);
}

export function playLevelUp() {
  if (isMuted()) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "sine", 0.25), i * 120);
  });
}
