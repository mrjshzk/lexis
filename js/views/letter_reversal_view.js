import { playCorrect, playIncorrect } from "../sound.js";
import { getExerciseContainer } from "../utils.js";
import { speakSequence, stop } from "../tts.js";

export default class LetterReversalView {
  constructor(model, container) {
    this.model = model;
    this.container = container;
    this._onLetterClick = this._onLetterClick.bind(this);
    this._onOptionClick = this._onOptionClick.bind(this);
    this._readAloud = this._readAloud.bind(this);
  }

  _getContainer() {
    return getExerciseContainer(this);
  }

  render() {
    const c = this._getContainer();
    if (!c) return;
    this._selected = null;

    const chars = this.model.displayWord.split("");
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt position-relative">
          Tap the wrong letter, then pick the correct one
          <button class="lexis-tts-btn position-absolute top-50 end-0 translate-middle-y me-2" title="Read aloud">🔊</button>
        </div>
        <div class="lexis-hint-toggle d-flex align-items-center gap-1 small cursor-pointer mb-2">
          <span class="lexis-hint-arrow" style="font-size:0.65rem;">▶</span> Hint
        </div>
        <div class="lexis-hint-text small text-secondary mb-3 d-none">${this.model.hint || "No hint available"}</div>
        <div class="d-flex justify-content-center flex-wrap gap-2" id="lr-letter-row">
          ${chars
            .map((ch, i) => {
              const isWrong = i === this.model.swappedIndex;
              return `<button class="btn rounded-3 shadow-sm fw-bold fs-4 d-flex align-items-center justify-content-center lexis-tile ${isWrong ? "lexis-reversal-wrong" : "lexis-reversal-letter"}" data-index="${i}" style="width:3rem;height:3.5rem;">${ch}</button>`;
            })
            .join("")}
        </div>
        <div id="lr-options" class="d-flex justify-content-center flex-wrap gap-2 d-none">
          ${this.model.options.map((o) => `<button class="btn rounded-4 px-4 py-2 shadow-sm lexis-ex-option" data-opt="${o}">${o}</button>`).join("")}
        </div>
        <div id="lr-feedback"></div>
      </div>`;

    c.querySelectorAll("#lr-letter-row button").forEach((btn) =>
      btn.addEventListener("click", this._onLetterClick),
    );
    c.querySelectorAll("#lr-options button").forEach((btn) =>
      btn.addEventListener("click", this._onOptionClick),
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
    const texts = ["Tap the wrong letter, then pick the correct one"];
    if (this.model.hint) texts.push(this.model.hint);
    try {
      await speakSequence(texts);
    } catch {}
    btn.disabled = false;
  }

  _onLetterClick(e) {
    stop();
    const c = this._getContainer();
    if (!c) return;
    const index = parseInt(e.currentTarget.dataset.index);

    c.querySelectorAll("#lr-letter-row button").forEach((btn) => {
      btn.classList.remove("lexis-reversal-selected");
      btn.style.transform = "";
    });

    e.currentTarget.classList.add("lexis-reversal-selected");
    e.currentTarget.style.transform = "scale(1.1)";

    this._selected = index;
    c.querySelector("#lr-options").classList.remove("d-none");
  }

  _onOptionClick(e) {
    const c = this._getContainer();
    if (!c) return;
    const choice = e.currentTarget.getAttribute("data-opt");
    c.querySelectorAll("#lr-options button").forEach(
      (b) => (b.disabled = true),
    );
    c.querySelectorAll("#lr-letter-row button").forEach(
      (b) => (b.disabled = true),
    );

    if (this.model.checkAnswer(this._selected, choice)) {
      playCorrect();
      const chars = this.model.word.split("");
      const row = c.querySelector("#lr-letter-row");
      row.innerHTML = chars
        .map(
          (ch) =>
            `<div class="rounded-3 shadow-sm fw-bold fs-4 d-flex align-items-center justify-content-center lexis-tile lexis-flash-correct" style="width:3rem;height:3.5rem;">${ch}</div>`,
        )
        .join("");
      c.querySelector("#lr-options").classList.add("d-none");
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
      const correctChars = this.model.word.split("");
      const row = c.querySelector("#lr-letter-row");
      row.innerHTML = correctChars
        .map((ch, i) => {
          let cls =
            "rounded-3 shadow-sm fw-bold fs-4 d-flex align-items-center justify-content-center lexis-tile";
          if (i === this.model.swappedIndex) cls += " lexis-flash-correct";
          else if (i === this._selected) cls += " lexis-flash-incorrect";
          return `<div class="${cls}" style="width:3rem;height:3.5rem;">${ch}</div>`;
        })
        .join("");
      c.querySelector("#lr-options").classList.add("d-none");
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
