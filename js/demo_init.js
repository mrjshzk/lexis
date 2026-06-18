import SpellingModel from "./models/spelling_model.js";
import LetterDndModel from "./models/letter_dnd_model.js";
import MissingLettersModel from "./models/missing_letters_model.js";
import WordOrderModel from "./models/word_order_model.js";
import LetterReversalModel from "./models/letter_reversal_model.js";
import VisualDiscriminationModel from "./models/visual_discrimination_model.js";
import SpellingView from "./views/spelling_view.js";
import LetterDndView from "./views/letter_dnd_view.js";
import MissingLettersView from "./views/missing_letters_view.js";
import WordOrderView from "./views/word_order_view.js";
import LetterReversalView from "./views/letter_reversal_view.js";
import VisualDiscriminationView from "./views/visual_discrimination_view.js";

const TABS = [
  {
    label: "Spelling",
    Model: SpellingModel,
    View: SpellingView,
    data: { word: "orange", hint: "A citrus fruit" },
  },
  {
    label: "Letter DnD",
    Model: LetterDndModel,
    View: LetterDndView,
    data: { word: "apple", hint: "A common fruit" },
  },
  {
    label: "Missing",
    Model: MissingLettersModel,
    View: MissingLettersView,
    data: { word: "banana", hint: "A long yellow fruit" },
  },
];

let activeIndex = 0;

const container = document.getElementById("demo-container");
if (!container) {
  document.addEventListener("DOMContentLoaded", () => {
    const retry = document.getElementById("demo-container");
    if (retry) render(retry);
  });
} else {
  render(container);
}

document
  .getElementById("main-container")
  ?.addEventListener("index:render", () => {
    const fresh = document.getElementById("demo-container");
    if (fresh) render(fresh);
  });

function renderTabs() {
  return TABS.map((t, i) => {
    const active = i === activeIndex;
    const cls = active ? "lexis-tab-active" : "lexis-tab-inactive";
    return `<button class="btn btn-sm rounded-pill px-3 py-1 ${cls}" data-index="${i}">${t.label}</button>`;
  }).join("");
}

function renderDemo(stage) {
  const entry = TABS[activeIndex];
  stage.innerHTML = "";
  const model = new entry.Model(entry.data);
  const view = new entry.View(model, stage);
  view.render();
}

function render(container) {
  container.innerHTML = `
    <div class="lexis-demo-tabs">${renderTabs()}</div>
    <div class="lexis-demo-stage rounded-4 d-flex align-items-center justify-content-center"></div>
  `;
  container.querySelectorAll(".lexis-demo-tabs button").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      activeIndex = parseInt(e.target.dataset.index);
      render(container);
    }),
  );
  const stage = container.querySelector(".lexis-demo-stage");
  renderDemo(stage);
}
