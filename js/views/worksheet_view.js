import SpellingModel from "../models/spelling_model.js";
import LetterDndModel from "../models/letter_dnd_model.js";
import MissingLettersModel from "../models/missing_letters_model.js";
import LetterReversalModel from "../models/letter_reversal_model.js";
import VisualDiscriminationModel from "../models/visual_discrimination_model.js";
import SpellingView from "./spelling_view.js";
import LetterDndView from "./letter_dnd_view.js";
import MissingLettersView from "./missing_letters_view.js";
import LetterReversalView from "./letter_reversal_view.js";
import VisualDiscriminationView from "./visual_discrimination_view.js";
import WordOrderModel from "../models/word_order_model.js";
import WordOrderView from "./word_order_view.js";
import { celebrate, showFloatingLabel } from "../effects.js";
import HardcoreWorksheetModel from "../models/hardcore_worksheet_model.js";

export default class WorksheetView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById("main-container");
    this._onExerciseCompleted = this._onExerciseCompleted.bind(this);
  }

  render() {
    if (this.model.isCompleted()) {
      this._renderResults();
      return;
    }
    const exercise = this.model.getCurrentExercise();

    this.container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center position-relative w-100 lexis-min-h-full">
        <button id="leave-exercise" class="btn btn-light rounded-pill position-absolute shadow-sm lexis-leave-btn">Leave the exercise</button>
        <div id="exercise-container" class="w-100 d-flex flex-column align-items-center lexis-contained-narrow lexis-ex-pad"></div>
      </div>`;

    this.container
      .querySelector("#leave-exercise")
      .addEventListener("click", () => {
        if (window.confirm("Exit worksheet? Progress will be lost."))
          this.container.dispatchEvent(new CustomEvent("worksheet:cancel"));
      });

    const ec = this.container.querySelector("#exercise-container");
    let view;
    switch (exercise.type) {
      case "spelling":
        view = new SpellingView(new SpellingModel(exercise.data));
        break;
      case "letter_dnd":
        view = new LetterDndView(new LetterDndModel(exercise.data));
        break;
      case "missing":
        view = new MissingLettersView(new MissingLettersModel(exercise.data));
        break;
      case "word_order":
        view = new WordOrderView(new WordOrderModel(exercise.data));
        break;
      case "letter_reversal":
        view = new LetterReversalView(new LetterReversalModel(exercise.data));
        break;
      case "visual_discrimination":
        view = new VisualDiscriminationView(
          new VisualDiscriminationModel(exercise.data),
        );
        break;
      default:
        ec.innerHTML =
          '<div class="alert alert-danger">Unknown exercise type</div>';
        return;
    }
    view.render();
    this.container.addEventListener(
      "exerciseCompleted",
      this._onExerciseCompleted,
    );
  }

  async _onExerciseCompleted(e) {
    const ec = this.container.querySelector("#exercise-container");
    if (e.detail.correct && ec) {
      const isHardcore = this.model.hardcore;
      const label = isHardcore
        ? `+${HardcoreWorksheetModel.COIN_REWARD} Coins`
        : `+10 XP`;
      const cls = isHardcore ? "lexis-text-orange" : "lexis-text-green";
      showFloatingLabel(ec, label, cls);
    }
    this.container.removeEventListener(
      "exerciseCompleted",
      this._onExerciseCompleted,
    );
    if (this.model.hardcore && !e.detail.correct) {
      const correctCount = this.model.correctAnswers;
      const coinsEarned = correctCount * HardcoreWorksheetModel.COIN_REWARD;
      const user = await this.model.sessionModel?.getSession();
      let isNewBest = false;
      if (user) {
        isNewBest = correctCount > (user.hardcoreBest || 0);
        if (isNewBest) {
          user.hardcoreBest = correctCount;
          await this.model.sessionModel.updateUser(user);
        }
      }
      this._showHardcoreResult(correctCount, coinsEarned, isNewBest);
      return;
    }
    this.model.recordAnswer(e.detail.correct);
    if (!this.model.isCompleted()) this.model.nextExercise();
    this.container.classList.add("fade");
    setTimeout(() => {
      this.container.classList.remove("fade");
      this.render();
    }, 300);
  }

  async _renderResults() {
    const { correct, total } = this.model.getScore();
    const xp = correct * 10;
    const pct = total > 0 ? correct / total : 0;
    let msg = "Keep practicing!";
    if (pct >= 1) msg = "Perfect!";
    else if (pct >= 0.6) msg = "Good work!";

    const user = await this.model.sessionModel?.getSession();
    let levelProgressHtml = "";
    if (user) {
      const xpInto = user.xp % 200;
      const pct = Math.round((xpInto / 200) * 100);
      levelProgressHtml = `
        <div class="mt-3">
          <div class="d-flex justify-content-between small text-secondary mb-1">
            <span>Level ${user.level}</span>
            <span>${xpInto}/200 XP</span>
          </div>
          <div class="progress lexis-progress-thin">
            <div class="progress-bar lexis-bar-green" style="width:${pct}%"></div>
          </div>
        </div>`;
    }

    this.container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center w-100 lexis-min-h-full">
        <div class="rounded-4 shadow-sm p-4 text-center lexis-result-card">
          <h4 class="mb-3 lexis-text-p">${msg}</h4>
          <p class="fs-5 lexis-text-p">Score: <strong>${correct}/${total}</strong></p>
          <p class="fs-5 lexis-text-p">XP earned: <strong>${xp}</strong></p>
          ${levelProgressHtml}
          <button id="back-btn" class="btn text-white mt-3 rounded-3 px-4 lexis-btn-primary">Back to Levels</button>
        </div>
      </div>`;
    this.container
      .querySelector("#back-btn")
      .addEventListener("click", () =>
        this.container.dispatchEvent(new CustomEvent("worksheet:cancel")),
      );
    setTimeout(() => celebrate(), 200);
  }

  _showHardcoreResult(correct, coins, isNewBest) {
    this.container.innerHTML = `
      <div class="lexis-levelup-overlay">
        <div class="lexis-levelup-card">
          <div style="font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">Game Over!</div>
          <div class="fs-5 mb-2">Correct answers: <strong>${correct}</strong></div>
          <div class="fs-5 mb-2 lexis-text-orange">Coins earned: <strong>${coins}</strong></div>
          ${isNewBest ? '<div class="fs-6 lexis-text-green mt-2">New personal best!</div>' : ""}
          <button id="hardcore-back-btn" class="btn text-white mt-3 rounded-3 px-4 lexis-btn-primary">Back to Levels</button>
        </div>
      </div>`;
    this.container
      .querySelector("#hardcore-back-btn")
      .addEventListener("click", () => {
        this.container.dispatchEvent(new CustomEvent("worksheet:cancel"));
      });
  }
}
