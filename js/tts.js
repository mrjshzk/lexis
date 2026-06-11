const DEFAULT_RATE = 0.85;
const DEFAULT_LANG = "en-US";
const SEGMENT_PAUSE = 300;

let seqId = 0;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function speak(text, options = {}) {
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = options.rate ?? DEFAULT_RATE;
    utter.lang = options.lang ?? DEFAULT_LANG;
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };
    utter.onend = done;
    utter.onerror = done;
    const fallbackMs = Math.min(text.length * 80 + 1000, 15000);
    setTimeout(done, fallbackMs);
    window.speechSynthesis.speak(utter);
  });
}

export async function speakSequence(texts, options = {}) {
  const id = ++seqId;
  for (const text of texts) {
    if (seqId !== id) break;
    if (!text || !text.trim()) continue;
    await speak(text, options);
    if (seqId !== id) break;
    await delay(SEGMENT_PAUSE);
  }
}

export function stop() {
  seqId++;
  window.speechSynthesis.cancel();
}

export function isSpeaking() {
  return window.speechSynthesis.speaking;
}
