import WorksheetModel from "../models/worksheet_model.js";
import HardcoreWorksheetModel from "../models/hardcore_worksheet_model.js";
import WorksheetView from "./worksheet_view.js";
import { WORDS, SENTENCES } from "../data.js";

const TYPES = ["spelling", "letter_dnd", "missing", "word_order", "letter_reversal", "visual_discrimination"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateExercises(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const type = rand(TYPES);
    let data;
    switch (type) {
      case "spelling": { const w = rand(WORDS); data = { word: w.word, hint: w.hint }; break; }
      case "letter_dnd": { const w = rand(WORDS); data = { word: w.word, hint: w.hint }; break; }
      case "missing": { const w = rand(WORDS); data = { word: w.word, hint: w.hint }; break; }
      case "word_order": { const s = rand(SENTENCES); data = { sentence: s.sentence, hint: s.hint }; break; }
      case "letter_reversal": { const w = rand(WORDS); data = { word: w.word, hint: w.hint }; break; }
      case "visual_discrimination": { const w = rand(WORDS); data = { word: w.word, hint: w.hint }; break; }
    }
    out.push({ type, data });
  }
  return out;
}

const TOTAL_STEPS = 10;

export class LevelsView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    this.currentMode = "normal";
    const btn = document.querySelector("#btn-levels");
    if (btn) btn.onclick = () => this.render();
  }

  async _getProgress() {
    const user = await this.sessionModel.getSession();
    return Math.min(user?.solvedSheets?.length ?? 0, TOTAL_STEPS);
  }

  async render() {
    if (window.setActiveTab) window.setActiveTab(null);
    const user = await this.sessionModel.getSession();
    const isGuest = user?.isAnonymous ?? false;
    const guestCapped = isGuest && (user?.solvedSheets?.length ?? 0) >= 2;
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
        this.sessionModel.convertGuestToAccount({ name, email, password }).then((r) => {
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

    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center h-100 py-4">
        ${!isGuest ? `
        <div class="mb-4">
          <select id="mode-select" class="form-select d-inline-block text-white border-0 rounded-4 px-4 py-2 lexis-mode-select">
            <option value="normal" ${isNormal ? "selected" : ""}>Normal Mode</option>
            <option value="hardcore" ${!isNormal ? "selected" : ""}>Hard Mode</option>
          </select>
        </div>
        ` : ''}

        ${isNormal ? `
        <div class="position-relative flex-grow-1 d-flex align-items-center justify-content-center">
          ${progress === 0 ? '<div class="alert lexis-prompt-bar rounded-4 px-4 py-3 text-center position-absolute" style="top:0;z-index:2;font-size:0.95rem;">Complete worksheets to unlock levels along the path!</div>' : ''}
          <div class="position-relative lexis-path" id="path-container">
            <svg class="position-absolute w-100 h-100 lexis-path-svg"
                 viewBox="0 0 280 520" preserveAspectRatio="none">
              ${this._renderConnectors()}
            </svg>
            ${this._renderNodes(progress)}
          </div>
        </div>
        ` : `
        <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center gap-2">
          <h2 class="fw-normal lexis-text-p">Hard Mode</h2>
          <p class="text-secondary">Earn <span class="lexis-text-orange">${HardcoreWorksheetModel.COIN_REWARD} coin</span> per correct answer</p>
          ${user.hardcoreBest > 0 ? `<p class="small lexis-text-p">Your best: <strong>${user.hardcoreBest}</strong> correct</p>` : ''}
          <p class="small text-secondary">One mistake and it's over</p>
        </div>
        `}

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
        if (!el.dataset.locked) el.addEventListener("click", () => this._startWorksheet());
      });
    }

    document.querySelector("#start-btn")?.addEventListener("click", () => this._startWorksheet());
  }

  _renderConnectors() {
    let html = "";
    const containerH = 520, leftX = 56, rightX = 224;
    for (let i = 0; i < TOTAL_STEPS - 1; i++) {
      const isLeft = i % 2 === 0;
      html += `<line x1="${isLeft ? leftX : rightX}" y1="${(i / (TOTAL_STEPS - 1)) * containerH}"
                     x2="${!isLeft ? leftX : rightX}" y2="${((i + 1) / (TOTAL_STEPS - 1)) * containerH}"
                     stroke="var(--lexis-connector)" stroke-width="2" stroke-dasharray="6 4" />`;
    }
    return html;
  }

  _renderNodes(progress) {
    let html = "";
    const containerH = 520, nodeSize = 44, half = nodeSize / 2;

    for (let i = 0; i < TOTAL_STEPS; i++) {
      const active = i === progress, locked = i > progress;
      const isLeft = i % 2 === 0;
      const top = (i / (TOTAL_STEPS - 1)) * containerH - half;
      const left = isLeft ? 56 - half : 224 - half;

      let cls = "position-absolute rounded-circle lvl-node lexis-node";
      if (locked) cls += " lexis-node-locked";
      else if (active) cls += " lexis-node-active";
      else cls += " lexis-node-done";

      const ring = active ? "box-shadow: 0 0 0 4px var(--lexis-bg-main), 0 0 0 7px var(--lexis-primary);" : "";

      html += `<div class="${cls}" data-idx="${i}" ${locked ? 'data-locked="true"' : ""}
               style="width:${nodeSize}px;height:${nodeSize}px;top:${top}px;left:${left}px;${ring}"
               onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'"></div>`;
    }
    return html;
  }

  _startWorksheet() {
    const modeSelect = document.querySelector("#mode-select");
    const mode = modeSelect ? modeSelect.value : "normal";
    const model = mode === "hardcore"
      ?       new HardcoreWorksheetModel(this.sessionModel)
      : new WorksheetModel(generateExercises(5), `worksheet-${Date.now()}`, this.sessionModel);
    new WorksheetView(model).render();
  }
}
