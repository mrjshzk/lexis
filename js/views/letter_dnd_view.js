import { playCorrect, playIncorrect } from "../sound.js";
import { speakSequence, stop } from "../tts.js";
import DragBaseView from "./drag_base_view.js";

export default class LetterDndView extends DragBaseView {
  constructor(model, container) {
    super(model, container);
    this._onCheck = this._onCheck.bind(this);
    this._readAloud = this._readAloud.bind(this);
  }

  render() {
    const c = this._getContainer();
    if (!c) return;
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt position-relative">
          Arrange the letters
          <button class="lexis-tts-btn position-absolute top-50 end-0 translate-middle-y me-2" title="Read aloud">🔊</button>
        </div>
        <div class="lexis-hint-toggle d-flex align-items-center gap-1 small cursor-pointer mb-2">
          <span class="lexis-hint-arrow" style="font-size:0.65rem;">▶</span> Hint
        </div>
        <div class="lexis-hint-text small text-secondary mb-3 d-none">${this.model.hint || "No hint available"}</div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 rounded-4 shadow-sm w-100 lexis-letter-zone" id="construction-zone">
          ${this.model.letters.map(() => `<div class="rounded-3 shadow-sm d-flex align-items-center justify-content-center lexis-tile-slot"></div>`).join("")}
        </div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 rounded-4 shadow-sm w-100 lexis-letter-zone" id="letter-pool">
          ${this.model.letters.map((l, i) => `<div class="rounded-3 shadow-sm fw-bold fs-5 d-flex align-items-center justify-content-center user-select-none lexis-tile lexis-grab" data-idx="${i}">${l}</div>`).join("")}
        </div>
        <button class="btn text-white w-100 fw-bold rounded-4 py-2 lexis-btn-primary" id="check-btn">Check</button>
        <div id="dnd-feedback"></div>
      </div>`;
    this._attachDrag(c, "#letter-pool > div");
    c.querySelector("#check-btn").addEventListener("click", this._onCheck);
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

  _onDrop(el, e) {
    const c = this._getContainer();
    if (!c) return;
    const cx = e.clientX,
      cy = e.clientY;
    const pool = c.querySelector("#letter-pool");
    const slots = c.querySelectorAll("#construction-zone > div");
    const poolTiles = c.querySelectorAll("#letter-pool > div");

    for (const s of slots) {
      const r = s.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const occ = s.firstElementChild;
        if (occ && occ !== el)
          this.dragState.originalParent.insertBefore(
            occ,
            this.dragState.originalRef,
          );
        s.appendChild(el);
        return;
      }
    }
    for (const o of poolTiles) {
      if (o === el) continue;
      const r = o.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const pa = el.parentNode,
          pb = o.parentNode,
          ra = el.nextSibling,
          rb = o.nextSibling;
        pa.insertBefore(o, ra);
        pb.insertBefore(el, rb);
        return;
      }
    }
    const pr = pool.getBoundingClientRect();
    if (cx >= pr.left && cx <= pr.right && cy >= pr.top && cy <= pr.bottom)
      pool.appendChild(el);
  }

  async _readAloud(e) {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    const texts = ["Arrange the letters"];
    if (this.model.hint) texts.push(this.model.hint);
    try {
      await speakSequence(texts);
    } catch {}
    btn.disabled = false;
  }

  _onCheck() {
    stop();
    const c = this._getContainer();
    if (!c) return;
    const ans = Array.from(
      c.querySelectorAll("#construction-zone > div > div"),
    ).map((el) => el.textContent.trim());
    c.querySelector("#check-btn").disabled = true;
    const slots = c.querySelectorAll("#construction-zone > div");

    if (this.model.checkAnswer(ans)) {
      playCorrect();
      slots.forEach((s) =>
        s.querySelector("div").classList.add("lexis-flash-correct"),
      );
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
      const zone = c.querySelector("#construction-zone");
      zone.classList.add("lexis-shake");
      slots.forEach((s, i) => {
        const correctLetter = this.model.word[i];
        if (
          !s.querySelector("div") ||
          s.querySelector("div").textContent.trim() !== correctLetter
        ) {
          s.innerHTML = `<div class="rounded-3 shadow-sm fw-bold fs-5 d-flex align-items-center justify-content-center user-select-none lexis-tile lexis-flash-incorrect">${correctLetter}</div>`;
        } else {
          s.querySelector("div").classList.add("lexis-flash-correct");
        }
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
