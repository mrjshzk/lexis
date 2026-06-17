import WorksheetModel from "../models/worksheet_model.js";
import HardcoreWorksheetModel from "../models/hardcore_worksheet_model.js";
import WorksheetView from "./worksheet_view.js";
import { WORDS, SENTENCES } from "../data.js";

const TYPES = [
  "spelling",
  "letter_dnd",
  "missing",
  "word_order",
  "letter_reversal",
  "visual_discrimination",
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateExercises(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const type = rand(TYPES);
    let data;
    switch (type) {
      case "spelling": {
        const w = rand(WORDS);
        data = { word: w.word, hint: w.hint };
        break;
      }
      case "letter_dnd": {
        const w = rand(WORDS);
        data = { word: w.word, hint: w.hint };
        break;
      }
      case "missing": {
        const w = rand(WORDS);
        data = { word: w.word, hint: w.hint };
        break;
      }
      case "word_order": {
        const s = rand(SENTENCES);
        data = { sentence: s.sentence, hint: s.hint };
        break;
      }
      case "letter_reversal": {
        const w = rand(WORDS);
        data = { word: w.word, hint: w.hint };
        break;
      }
      case "visual_discrimination": {
        const w = rand(WORDS);
        data = { word: w.word, hint: w.hint };
        break;
      }
    }
    out.push({ type, data });
  }
  return out;
}

const WINDOW_NODES = 5;
const HALF_WINDOW = 2;
const NODE_SIZE = 64;
const SPACING = 100;
const PERIOD = 6;
const CENTER_X = 140;
const AMPLITUDE = 120;

export class LevelsView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    this.currentMode = "normal";
    const btn = document.querySelector("#btn-levels");
    if (btn) btn.onclick = () => this.render();
  }

  async _getProgress() {
    const user = await this.sessionModel.getSession();
    return user?.solvedSheets?.length ?? 0;
  }

  async render() {
    if (window.setActiveTab) window.setActiveTab(null);
    const user = await this.sessionModel.getSession();
    const isGuest = user?.isAnonymous ?? false;
    const guestCapped = isGuest && (user?.solvedSheets?.length ?? 0) >= 1;
    const progress = await this._getProgress();
    const mc = document.querySelector("#main-container");
    const isNormal = this.currentMode === "normal";

    if (guestCapped) {
      mc.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center h-100 py-4">
          <div class="card rounded-4 shadow-sm p-4 w-100 lexis-card-sm">
            <h2 class="text-center fw-bold mb-3 lexis-landing-hero-title">Create an Account</h2>
            <p class="text-center text-secondary mb-4">You've completed 2 free worksheets! Create an account to keep learning and unlock all features.</p>
            <form id="guest-signup-form">
              <div class="mb-3"><label class="form-label mb-1">Username</label><input type="text" id="guest-signup-name" class="form-control rounded-4 py-2" required /></div>
              <div class="mb-3"><label class="form-label mb-1">Email</label><input type="email" id="guest-signup-email" class="form-control rounded-4 py-2" required /></div>
              <div class="mb-4"><label class="form-label mb-1">Password</label><input type="password" id="guest-signup-password" class="form-control rounded-4 py-2" required /></div>
              <p id="guest-signup-error" class="alert alert-danger py-2" style="display: none;"></p>
              <button type="submit" class="btn w-100 rounded-4 py-2 text-white lexis-btn-primary">Create Account</button>
            </form>
          </div>
        </div>`;
      mc.querySelector("#guest-signup-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = mc.querySelector("#guest-signup-name").value.trim();
        const email = mc.querySelector("#guest-signup-email").value.trim();
        const password = mc.querySelector("#guest-signup-password").value;
        this.sessionModel
          .convertGuestToAccount({ name, email, password })
          .then((r) => {
            if (!r.ok) {
              const err = mc.querySelector("#guest-signup-error");
              err.textContent = r.error;
              err.style.display = "block";
            } else {
              mc.dispatchEvent(new CustomEvent("worksheet:cancel"));
            }
          });
      });
      return;
    }

    const startIdx = Math.max(0, progress - HALF_WINDOW);
    const endIdx = startIdx + WINDOW_NODES - 1;

    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center h-100 py-4">
        ${
          !isGuest
            ? `
        <div class="mb-4">
          <select id="mode-select" class="form-select d-inline-block text-white border-0 rounded-4 px-4 py-2 lexis-mode-select">
            <option value="normal" ${isNormal ? "selected" : ""}>Normal Mode</option>
            <option value="hardcore" ${!isNormal ? "selected" : ""}>Hard Mode</option>
          </select>
        </div>
        `
            : ""
        }

        ${
          isNormal
            ? `
        <div class="position-relative flex-grow-1 d-flex align-items-center justify-content-center">
          ${progress === 0 ? '<div class="alert lexis-prompt-bar rounded-4 px-4 py-3 text-center position-absolute" style="top:0;z-index:2;font-size:0.95rem;">Complete worksheets to unlock levels along the path!</div>' : ""}
          <div class="position-relative lexis-path" id="path-container">
            <svg class="position-absolute w-100 h-100 lexis-path-svg"
                 viewBox="0 0 280 520" preserveAspectRatio="none">
              ${this._renderPath(startIdx, endIdx)}
            </svg>
            ${this._renderNodes(startIdx, endIdx, progress)}
          </div>
        </div>
        `
            : `
        <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center gap-2">
          <h2 class="fw-normal lexis-text-p">Hard Mode</h2>
          <p class="text-secondary">Earn <span class="lexis-text-orange">${HardcoreWorksheetModel.COIN_REWARD} coin</span> per correct answer</p>
          ${user.hardcoreBest > 0 ? `<p class="small lexis-text-p">Your best: <strong>${user.hardcoreBest}</strong> correct</p>` : ""}
          <p class="small text-secondary">One mistake and it's over</p>
        </div>
        `
        }

        <div class="mt-3 mb-4">
          <button id="start-btn" class="btn text-white rounded-3 px-5 py-2 lexis-btn-start">Start</button>
        </div>
      </div>`;

    const modeSelect = document.querySelector("#mode-select");
    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        this.currentMode = modeSelect.value;
        this.render();
      });
    }

    if (isNormal) {
      mc.querySelectorAll(".lvl-node[data-idx]").forEach((el) => {
        if (!el.dataset.locked)
          el.addEventListener("click", () => this._startWorksheet());
      });
    }

    document
      .querySelector("#start-btn")
      ?.addEventListener("click", () => this._startWorksheet());
  }

  _nodeX(i) {
    return CENTER_X + AMPLITUDE * Math.cos((2 * Math.PI * i) / PERIOD);
  }

  _topY() {
    return 260 - HALF_WINDOW * SPACING;
  }

  _renderPath(startIdx, endIdx) {
    const parts = [];
    for (let i = startIdx; i < endIdx; i++) {
      const x0 = this._nodeX(i);
      const y0 = this._topY() + (i - startIdx) * SPACING;
      const x1 = this._nodeX(i + 1);
      const y1 = this._topY() + (i + 1 - startIdx) * SPACING;
      const xm1 = this._nodeX(i - 1);
      const ym1 = this._topY() + (i - 1 - startIdx) * SPACING;
      const x2 = this._nodeX(i + 2);
      const y2 = this._topY() + (i + 2 - startIdx) * SPACING;
      const cp1x = x0 + (x1 - xm1) / 6;
      const cp1y = y0 + (y1 - ym1) / 6;
      const cp2x = x1 - (x2 - x0) / 6;
      const cp2y = y1 - (y2 - y0) / 6;
      parts.push(`M ${x0} ${y0} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x1} ${y1}`);
    }
    return `<path d="${parts.join(" ")}" stroke="var(--lexis-connector)" stroke-width="2" stroke-dasharray="6 4" fill="none" />`;
  }

  _renderNodes(startIdx, endIdx, progress) {
    let html = "";
    const half = NODE_SIZE / 2;
    for (let i = startIdx; i <= endIdx; i++) {
      const active = i === progress,
        locked = i > progress;
      const x = this._nodeX(i) - half;
      const y = this._topY() + (i - startIdx) * SPACING - half;

      let cls = "position-absolute rounded-circle lvl-node lexis-node";
      if (locked) cls += " lexis-node-locked";
      else if (active) cls += " lexis-node-active";
      else cls += " lexis-node-done";

      const ring = active
        ? "box-shadow: 0 0 0 4px var(--lexis-bg-main), 0 0 0 7px var(--lexis-primary);"
        : "";

      html += `<div class="${cls}" data-idx="${i}" ${locked ? 'data-locked="true"' : ""}
               style="width:${NODE_SIZE}px;height:${NODE_SIZE}px;top:${y}px;left:${x}px;${ring}"
               onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'"></div>`;
    }
    return html;
  }

  _startWorksheet() {
    const modeSelect = document.querySelector("#mode-select");
    const mode = modeSelect ? modeSelect.value : "normal";
    const model =
      mode === "hardcore"
        ? new HardcoreWorksheetModel(this.sessionModel)
        : new WorksheetModel(
            generateExercises(5),
            `worksheet-${Date.now()}`,
            this.sessionModel,
          );
    new WorksheetView(model).render();
  }
}
