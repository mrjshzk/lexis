import { playCorrect, playIncorrect } from "../sound.js";
import { speakSequence, stop } from "../tts.js";
import DragBaseView from "./drag_base_view.js";

export default class WordOrderView extends DragBaseView {
  constructor(model, container) {
    super(model, container);
    this.selected = [];
    this._onSubmit = this._onSubmit.bind(this);
    this._onHintWord = this._onHintWord.bind(this);
    this._readAloud = this._readAloud.bind(this);
  }

  render() {
    const c = this._getContainer();
    if (!c) return;
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt position-relative">
          Arrange the words in correct order
          <button class="lexis-tts-btn position-absolute top-50 end-0 translate-middle-y me-2" title="Read aloud">🔊</button>
        </div>
        <div class="lexis-hint-toggle d-flex align-items-center gap-1 small cursor-pointer mb-2">
          <span class="lexis-hint-arrow" style="font-size:0.65rem;">▶</span> Hint
        </div>
        <div class="lexis-hint-text small text-secondary mb-3 d-none">${this.model.hint || "No hint available"}</div>
        <div id="sentence-zone" class="rounded-4 shadow-sm p-3 d-flex flex-wrap align-items-center w-100 lexis-sentence-zone"></div>
        <div id="word-pool" class="d-flex flex-wrap justify-content-center gap-2">
          ${this.model.shuffled.map((w, i) => `<button class="btn rounded-pill me-2 mb-2 word-chip shadow-sm lexis-word-chip lexis-grab" data-index="${i}">${w}</button>`).join("")}
        </div>
        <div class="d-flex gap-2 w-100">
          <button id="hint-btn" class="btn rounded-4 py-2 flex-fill lexis-btn-undo">Hint word</button>
          <button id="submit-btn" class="btn text-white rounded-4 py-2 flex-fill lexis-btn-primary">Submit</button>
        </div>
        <div id="order-feedback"></div>
      </div>`;
    this._attachDrag(c, "#word-pool .word-chip");
    c.querySelector("#submit-btn").addEventListener("click", this._onSubmit);
    c.querySelector("#hint-btn").addEventListener("click", this._onHintWord);
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

  _rebuildSelected() {
    const c = this._getContainer();
    const chips = c.querySelectorAll("#sentence-zone .word-chip");
    this.selected = Array.from(chips).map((chip) => ({
      idx: chip.getAttribute("data-index"),
      word: chip.textContent,
    }));
  }

  _onDrop(el, e) {
    const c = this._getContainer();
    if (!c) return;
    const cx = e.clientX,
      cy = e.clientY;
    const zone = c.querySelector("#sentence-zone");
    const zoneRect = zone.getBoundingClientRect();
    const pool = c.querySelector("#word-pool");

    if (
      cx >= zoneRect.left &&
      cx <= zoneRect.right &&
      cy >= zoneRect.top &&
      cy <= zoneRect.bottom
    ) {
      if (el.parentNode === pool) {
        el.classList.add("lexis-chip-selected");
      }
      const chips = zone.querySelectorAll(".word-chip");
      let inserted = false;
      for (const chip of chips) {
        if (chip === el) continue;
        const r = chip.getBoundingClientRect();
        if (cx < r.left + r.width / 2) {
          zone.insertBefore(el, chip);
          inserted = true;
          break;
        }
      }
      if (!inserted) zone.appendChild(el);
      this._rebuildSelected();
      return;
    }
    pool.appendChild(el);
    el.classList.remove("lexis-chip-selected");
    this._rebuildSelected();
  }

  _onHintWord() {
    const c = this._getContainer();
    if (!c) return;
    const usedIndices = new Set(this.selected.map((s) => parseInt(s.idx)));
    for (let i = 0; i < this.model.words.length; i++) {
      const idx = this.model.shuffled.findIndex(
        (w) => w === this.model.words[i],
      );
      if (!usedIndices.has(idx)) {
        const chip = c.querySelector(`#word-pool button[data-index='${idx}']`);
        if (chip) {
          const zone = c.querySelector("#sentence-zone");
          chip.classList.add("lexis-chip-selected");
          zone.appendChild(chip);
          this._rebuildSelected();
        }
        return;
      }
    }
    c.querySelector("#hint-btn").disabled = true;
  }

  async _readAloud(e) {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    const texts = ["Arrange the words in correct order"];
    if (this.model.hint) texts.push(this.model.hint);
    texts.push(...this.model.shuffled);
    try {
      await speakSequence(texts);
    } catch {}
    btn.disabled = false;
  }

  _onSubmit() {
    stop();
    const c = this._getContainer();
    if (!c) return;
    c.querySelector("#submit-btn").disabled = true;
    c.querySelector("#hint-btn").disabled = true;
    const zone = c.querySelector("#sentence-zone");

    if (this.model.checkAnswer(this.selected.map((s) => s.word))) {
      playCorrect();
      zone.classList.add("lexis-correct-pulse");
      const correctWords = this.model.original.split(/\s+/);
      zone.innerHTML = correctWords
        .map(
          (w) =>
            `<button class="btn rounded-pill me-2 mb-2 shadow-sm lexis-word-chip lexis-flash-correct">${w}</button>`,
        )
        .join("");

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
      zone.classList.add("lexis-shake");
      const correctWords = this.model.original.split(/\s+/);
      zone.innerHTML = correctWords
        .map(
          (w) =>
            `<button class="btn rounded-pill me-2 mb-2 shadow-sm lexis-word-chip lexis-flash-incorrect">${w}</button>`,
        )
        .join("");
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
