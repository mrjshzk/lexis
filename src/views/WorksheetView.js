export class WorksheetView {
  #container;
  #onBack;
  #onComplete;
  #onRequestWorksheet;

  constructor({ container, onBack, onComplete, onRequestWorksheet }) {
    this.#container = container;
    this.#onBack = onBack;
    this.#onComplete = onComplete;
    this.#onRequestWorksheet = onRequestWorksheet;
  }

  renderList(worksheets, session) {
    const cards = worksheets
      .map((ws) => {
        const locked = !ws.isUnlocked;
        const completed = ws.isCompleted;

        return `
        <div class="col-sm-6 col-lg-4">
          <div class="card worksheet-card h-100 text-center p-3
            ${locked ? "worksheet-locked" : ""}
            ${completed ? "worksheet-completed" : ""}
          ">
            <div class="card-body d-flex flex-column">
              <div class="worksheet-icon mb-2
                ${locked ? "text-body-secondary" : completed ? "text-success" : "text-info"}">
                <i class="${ws.icon} fa-2x"></i>
              </div>
              <h5 class="card-title fw-bold mb-1">${ws.title}</h5>
              <p class="card-text text-body-secondary small flex-grow-1">${ws.description}</p>
              <div class="d-flex justify-content-center gap-2 my-2 flex-wrap">
                <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                  <i class="fa-solid fa-star me-1"></i>${ws.xpReward} XP
                </span>
                ${
                  completed
                    ? `<span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                         <i class="fa-solid fa-circle-check me-1"></i>Concluída
                       </span>`
                    : ""
                }
                ${
                  locked
                    ? `<span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                         <i class="fa-solid fa-lock me-1"></i>${ws.requiredXP} XP necessários
                       </span>`
                    : ""
                }
              </div>
              <button
                class="btn ${completed ? "btn-outline-success" : "btn-info text-white"} btn-sm mt-auto btn-start-ws"
                data-ws-id="${ws.id}"
                ${locked ? "disabled" : ""}
              >
                ${
                  completed
                    ? `<i class="fa-solid fa-rotate me-1"></i>Repetir`
                    : `<i class="fa-solid fa-play me-1"></i>Começar`
                }
              </button>
            </div>
          </div>
        </div>`;
      })
      .join("");

    this.#container.innerHTML = `
      <div class="row mb-4">
        <div class="col-12">
          <button id="btn-back-home" class="btn btn-outline-secondary btn-sm mb-3">
            <i class="fa-solid fa-arrow-left me-1"></i>Voltar
          </button>
          <h2 class="fw-bold">Modo Normal — Fichas</h2>
          <p class="text-body-secondary mb-0">
            <i class="fa-solid fa-star text-info me-1"></i>
            XP atual: <strong>${session.xp}</strong> &nbsp;|&nbsp;
            Nível <strong>${session.level}</strong>
          </p>
        </div>
      </div>
      <div class="row g-4">${cards}</div>`;

    this.#container
      .querySelector("#btn-back-home")
      ?.addEventListener("click", this.#onBack);

    this.#container.querySelectorAll(".btn-start-ws").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.#onRequestWorksheet(btn.dataset.wsId)
      );
    });
  }

  renderWorksheet(worksheet) {
    let currentIdx = 0;
    const answers = [];
    const exercises = worksheet.exercises;

    const renderExercise = () => {
      const exercise = exercises[currentIdx];
      const progressPct = Math.round((currentIdx / exercises.length) * 100);

      const optionButtons = exercise.options
        .map(
          (opt) =>
            `<button class="btn btn-outline-primary btn-option w-100 mb-2 py-2 fs-5" data-value="${opt}">
               ${opt}
             </button>`
        )
        .join("");

      this.#container.innerHTML = `
        <div class="row mb-3">
          <div class="col-12">
            <button id="btn-back-ws-list" class="btn btn-outline-secondary btn-sm mb-3">
              <i class="fa-solid fa-arrow-left me-1"></i>Fichas
            </button>
            <h4 class="fw-bold">${worksheet.title}</h4>
            <div class="d-flex align-items-center gap-2 mb-1">
              <div class="progress flex-grow-1" style="height:8px">
                <div
                  class="progress-bar bg-info"
                  role="progressbar"
                  style="width:${progressPct}%"
                  aria-valuenow="${progressPct}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <span class="text-body-secondary small text-nowrap">
                ${currentIdx + 1} / ${exercises.length}
              </span>
            </div>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-5">
            <div class="card shadow-sm p-4">
              <div class="card-body text-center">
                <p class="fs-5 fw-semibold mb-4">${exercise.question}</p>
                <div id="options">${optionButtons}</div>
                <div id="feedback" class="mt-3 d-none"></div>
              </div>
            </div>
          </div>
        </div>`;

      this.#container
        .querySelector("#btn-back-ws-list")
        ?.addEventListener("click", () => {
          this.#onBack();
        });

      this.#container.querySelectorAll(".btn-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          const selected = btn.dataset.value;
          const correct = selected === exercise.correctAnswer;

          // Disable all options
          this.#container
            .querySelectorAll(".btn-option")
            .forEach((b) => (b.disabled = true));

          // Style selected
          btn.classList.replace("btn-outline-primary", correct ? "btn-success" : "btn-danger");

          // Highlight correct answer if wrong
          if (!correct) {
            this.#container.querySelectorAll(".btn-option").forEach((b) => {
              if (b.dataset.value === exercise.correctAnswer) {
                b.classList.replace("btn-outline-primary", "btn-success");
              }
            });
          }

          answers.push({ id: exercise.id, selected, correct });

          const feedback = this.#container.querySelector("#feedback");
          feedback.classList.remove("d-none");
          feedback.innerHTML = correct
            ? `<div class="alert alert-success py-2 mb-0">
                 <i class="fa-solid fa-check me-1"></i>Correto! 🎉
               </div>`
            : `<div class="alert alert-danger py-2 mb-0">
                 <i class="fa-solid fa-xmark me-1"></i>Incorreto!
                 A resposta certa é <strong>${exercise.correctAnswer}</strong>.
               </div>`;

          setTimeout(() => {
            currentIdx++;
            if (currentIdx < exercises.length) {
              renderExercise();
            } else {
              this.#renderResults(worksheet, answers);
            }
          }, 1600);
        });
      });
    };

    renderExercise();
  }

  #renderResults(worksheet, answers) {
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 60;

    if (passed) {
      this.#onComplete(worksheet.id);
    }

    this.#container.innerHTML = `
      <div class="row justify-content-center mt-4">
        <div class="col-md-6 col-lg-4 text-center">
          <div class="card shadow-sm p-4">
            <div class="card-body">
              <div class="display-2 mb-3">${passed ? "🏆" : "😢"}</div>
              <h3 class="fw-bold mb-2">${passed ? "Parabéns!" : "Tenta outra vez!"}</h3>
              <p class="text-body-secondary">
                ${correct} de ${total} respostas corretas (${pct}%)
              </p>
              ${
                passed
                  ? `<div class="alert alert-success py-2">
                       <i class="fa-solid fa-star me-1"></i>
                       +<strong>${worksheet.xpReward} XP</strong> ganhos!
                     </div>`
                  : `<div class="alert alert-warning py-2">
                       Precisas de pelo menos 60% para completar a ficha.
                     </div>`
              }
              <div class="d-flex gap-2 justify-content-center mt-3">
                <button id="btn-to-list" class="btn btn-outline-secondary">
                  <i class="fa-solid fa-list me-1"></i>Fichas
                </button>
                <button id="btn-retry" class="btn btn-info text-white">
                  <i class="fa-solid fa-rotate me-1"></i>Repetir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    this.#container.querySelector("#btn-to-list")?.addEventListener("click", () => {
      this.#onBack();
    });

    this.#container.querySelector("#btn-retry")?.addEventListener("click", () => {
      this.#onRequestWorksheet(worksheet.id);
    });
  }
}
