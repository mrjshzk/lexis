import { playCorrect, playIncorrect } from "../sound.js";
import { getExerciseContainer } from "../utils.js";
import { speakSequence, stop } from "../tts.js";

export default class MissingLettersView {
  constructor(model, container) { this.model = model; this.container = container; this._onSubmit = this._onSubmit.bind(this); this._readAloud = this._readAloud.bind(this); }
  _getContainer() { return getExerciseContainer(this); }

  render() {
    const c = this._getContainer();
    if (!c) return;
    const parts = this.model.getDisplayWord().split("_");
    let html = "";
    for (let i = 0; i < parts.length; i++) {
      html += `<span class="fs-4 fw-bold lexis-text-p">${parts[i]}</span>`;
      if (i < this.model.blanks.length) html += `<input type="text" maxlength="1" class="form-control mx-2 text-center fw-bold fs-4 rounded-3 shadow-sm lexis-input-blank" data-index="${i}">`;
    }
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt position-relative">
          Fill in the missing letters
          <button class="lexis-tts-btn position-absolute top-50 end-0 translate-middle-y me-2" title="Read aloud">🔊</button>
        </div>
        <div class="lexis-hint-toggle d-flex align-items-center gap-1 small cursor-pointer mb-2">
          <span class="lexis-hint-arrow" style="font-size:0.65rem;">▶</span> Hint
        </div>
        <div class="lexis-hint-text small text-secondary mb-3 d-none">${this.model.hint || "No hint available"}</div>
        <div class="d-flex align-items-center justify-content-center flex-nowrap py-3" style="white-space: nowrap;">${html}</div>
        <button id="missing-submit" class="btn text-white w-100 fw-bold rounded-4 py-2 lexis-btn-primary">Submit</button>
        <div id="missing-feedback"></div>
      </div>`;
    c.querySelector("#missing-submit").addEventListener("click", this._onSubmit);
    c.querySelector(".lexis-tts-btn")?.addEventListener("click", this._readAloud);
    const hintToggle = c.querySelector(".lexis-hint-toggle");
    const hintText = c.querySelector(".lexis-hint-text");
    if (hintToggle && hintText && this.model.hint) {
      hintToggle.addEventListener("click", () => {
        hintText.classList.toggle("d-none");
        hintToggle.querySelector(".lexis-hint-arrow").textContent =
          hintText.classList.contains("d-none") ? "▶" : "▼";
      });
    } else if (hintToggle) {
      hintToggle.classList.add("d-none");
    }
  }

  async _readAloud(e) {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    const texts = ["Fill in the missing letters"];
    if (this.model.hint) texts.push(this.model.hint);
    try { await speakSequence(texts); } catch {}
    btn.disabled = false;
  }

  _onSubmit() {
    stop();
    const c = this._getContainer();
    if (!c) return;
    const inputs = Array.from(c.querySelectorAll("input[data-index]"));
    inputs.forEach(inp => { inp.disabled = true; inp.classList.remove("is-invalid"); });
    c.querySelector("#missing-submit").disabled = true;

    if (this.model.checkAnswers(inputs.map(i => i.value.trim()))) {
      playCorrect();
      inputs.forEach(inp => inp.classList.add("lexis-correct-pulse", "lexis-flash-correct"));
      setTimeout(() => {
        c.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true }));
      }, 600);
    } else {
      playIncorrect();
      const chars = this.model.word.split("");
      inputs.forEach((inp, i) => {
        const correctChar = chars[this.model.blanks[i]];
        inp.classList.add("lexis-shake", "lexis-flash-incorrect");
        inp.value = correctChar;
        inp.classList.add("lexis-flash-correct");
      });
      setTimeout(() => {
        c.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: false }, bubbles: true }));
      }, 800);
    }
  }
}
