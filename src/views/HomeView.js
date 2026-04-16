export class HomeView {
  #container;
  #onNormalMode;
  #onShowAuth;

  constructor({ container, onNormalMode, onShowAuth }) {
    this.#container = container;
    this.#onNormalMode = onNormalMode;
    this.#onShowAuth = onShowAuth;
  }

  render(session) {
    this.#container.innerHTML = `
      <div class="row mb-5">
        <div class="col-12 text-center">
          <h1 class="fw-bold text-body mb-3">
            Bem vindo${session.isLoggedIn ? `, ${session.username}` : ""}! 👋
          </h1>
          <p class="fs-5 text-body-secondary">
            Estás no <strong>Nível&nbsp;<span id="home-level">${session.level}</span></strong>.
          </p>
          ${
            session.isAnonymous
              ? `<p class="text-body-secondary small mt-1">
                   <i class="fa-solid fa-circle-info text-info me-1"></i>
                   Estás como visitante anónimo.
                   <a href="#" id="link-register" class="text-primary">Cria uma conta</a>
                   para guardar o teu progresso entre sessões.
                 </p>`
              : ""
          }
        </div>
      </div>

      <div class="row g-4 justify-content-center">
        <!-- Normal mode -->
        <div class="col-md-5">
          <div class="card game-card h-100 bg-body-tertiary text-center p-4 border-bottom border-info border-5">
            <div class="card-body">
              <div class="display-1 text-info mb-3">
                <i class="fa-solid fa-map"></i>
              </div>
              <h2 class="card-title fw-bold text-body">Modo Normal</h2>
              <p class="card-text fs-5 text-body-secondary">
                Completa fichas para ganhar XP e subir de nível.
              </p>
              <button id="btn-normal" class="btn btn-info text-white btn-play mt-3 w-100 shadow-sm">
                <i class="fa-solid fa-play me-1"></i>Jogar Normal
              </button>
            </div>
          </div>
        </div>

        <!-- Hardcore mode -->
        <div class="col-md-5">
          <div class="card game-card h-100 bg-body-tertiary text-center p-4 border-bottom border-warning border-5">
            <div class="card-body">
              <div class="display-1 text-warning mb-3">
                <i class="fa-solid fa-fire"></i>
              </div>
              <h2 class="card-title fw-bold text-body">Modo Hardcore</h2>
              <p class="card-text fs-5 text-body-secondary">
                Supera desafios para ganhar moedas e personalizar o teu avatar.
              </p>
              <button
                id="btn-hardcore"
                class="btn btn-warning text-dark btn-play mt-3 w-100 shadow-sm"
                disabled
                title="Em breve"
              >
                <i class="fa-solid fa-bolt me-1"></i>Iniciar Desafio
              </button>
              <p class="text-body-secondary small mt-2 mb-0">
                <i class="fa-solid fa-clock me-1"></i>Em breve
              </p>
            </div>
          </div>
        </div>
      </div>`;

    this.#container
      .querySelector("#btn-normal")
      ?.addEventListener("click", this.#onNormalMode);

    this.#container
      .querySelector("#link-register")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.#onShowAuth("register");
      });
  }
}
