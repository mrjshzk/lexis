import SpellingModel from "../models/spelling_model.js";
import { playCorrect, playIncorrect } from "../sound.js";
import { getExerciseContainer } from "../utils.js";
import { speakSequence, stop } from "../tts.js";

export default class SpellingView {
  constructor(model, container) {
    this.model = model;
    this.container = container;
    this._onOptionClick = this._onOptionClick.bind(this);
    this._readAloud = this._readAloud.bind(this);
  }

  render() {
    const c = getExerciseContainer(this);
    if (!c) return;
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt position-relative">
          Choose the correct spelling!
          <button class="lexis-tts-btn position-absolute top-50 end-0 translate-middle-y me-2" title="Read aloud">🔊</button>
        </div>
        <div class="lexis-hint-toggle d-flex align-items-center gap-1 small cursor-pointer mb-2">
          <span class="lexis-hint-arrow" style="font-size:0.65rem;">▶</span> Hint
        </div>
        <div class="lexis-hint-text small text-secondary mb-3 d-none">${this.model.hint || "No hint available"}</div>
        ${this.model.options.map((o) => `<button class="btn rounded-4 w-100 py-3 text-center shadow-sm lexis-ex-option" data-opt="${o}">${o}</button>`).join("")}
        <div id="spelling-feedback" class="mt-2"></div>
      </div>`;
    c.querySelectorAll("button[data-opt]").forEach((b) =>
      b.addEventListener("click", this._onOptionClick),
    );
    c.querySelector(".lexis-tts-btn")?.addEventListener(
      "click",
      this._readAloud,
    );
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
    const texts = ["Choose the correct spelling!"];
    if (this.model.hint) texts.push(this.model.hint);
    texts.push(...this.model.options);
    try {
      await speakSequence(texts);
    } catch {}
    btn.disabled = false;
  }

  _onOptionClick(e) {
    stop();
    const c = getExerciseContainer(this);
    const btn = e.currentTarget;
    const chosen = btn.getAttribute("data-opt");
    const correct = this.model.word;
    const allBtns = c.querySelectorAll("button[data-opt]");
    allBtns.forEach((b) => (b.disabled = true));

    if (this.model.checkAnswer(chosen)) {
      playCorrect();
      btn.classList.add("lexis-correct-pulse", "lexis-flash-correct");
      setTimeout(() => {
        c.dispatchEvent(
          new CustomEvent("exerciseCompleted", {
            detail: { correct: true },
            bubbles: true,
          }),
        );
      }, 600);
    } else {
      playIncorrect();
      btn.classList.add("lexis-shake", "lexis-flash-incorrect");
      allBtns.forEach((b) => {
        if (b.getAttribute("data-opt") === correct)
          b.classList.add("lexis-flash-correct");
      });
      setTimeout(() => {
        c.dispatchEvent(
          new CustomEvent("exerciseCompleted", {
            detail: { correct: false },
            bubbles: true,
          }),
        );
      }, 800);
    }
  }
}
