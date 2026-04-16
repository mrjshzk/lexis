import { Modal } from "bootstrap";

export class AuthView {
  #el;
  #modal = null;
  #onLogin;
  #onRegister;

  constructor({ onLogin, onRegister }) {
    this.#onLogin = onLogin;
    this.#onRegister = onRegister;
    this.#build();
  }

  #build() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0 pb-0">
              <ul class="nav nav-tabs w-100" id="authTabs" role="tablist">
                <li class="nav-item flex-fill text-center" role="presentation">
                  <button
                    class="nav-link active w-100"
                    id="tab-login"
                    data-bs-toggle="tab"
                    data-bs-target="#pane-login"
                    type="button"
                    role="tab"
                  >
                    <i class="fa-solid fa-right-to-bracket me-1"></i>Entrar
                  </button>
                </li>
                <li class="nav-item flex-fill text-center" role="presentation">
                  <button
                    class="nav-link w-100"
                    id="tab-register"
                    data-bs-toggle="tab"
                    data-bs-target="#pane-register"
                    type="button"
                    role="tab"
                  >
                    <i class="fa-solid fa-user-plus me-1"></i>Registar
                  </button>
                </li>
              </ul>
              <button
                type="button"
                class="btn-close ms-2 mb-auto"
                data-bs-dismiss="modal"
                aria-label="Fechar"
              ></button>
            </div>

            <div class="modal-body">
              <div class="tab-content">

                <!-- Login pane -->
                <div class="tab-pane fade show active" id="pane-login" role="tabpanel">
                  <form id="form-login" novalidate class="mt-2">
                    <div class="mb-3">
                      <label for="login-email" class="form-label">Email</label>
                      <input
                        type="email"
                        class="form-control"
                        id="login-email"
                        placeholder="email@exemplo.com"
                        autocomplete="email"
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label for="login-password" class="form-label">Palavra-passe</label>
                      <input
                        type="password"
                        class="form-control"
                        id="login-password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        required
                      />
                    </div>
                    <div id="login-error" class="alert alert-danger d-none py-2 small"></div>
                    <button type="submit" class="btn btn-primary w-100">
                      <i class="fa-solid fa-right-to-bracket me-1"></i>Entrar
                    </button>
                  </form>
                </div>

                <!-- Register pane -->
                <div class="tab-pane fade" id="pane-register" role="tabpanel">
                  <form id="form-register" novalidate class="mt-2">
                    <div class="mb-3">
                      <label for="reg-username" class="form-label">Nome de utilizador</label>
                      <input
                        type="text"
                        class="form-control"
                        id="reg-username"
                        placeholder="O teu nome"
                        autocomplete="username"
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label for="reg-email" class="form-label">Email</label>
                      <input
                        type="email"
                        class="form-control"
                        id="reg-email"
                        placeholder="email@exemplo.com"
                        autocomplete="email"
                        required
                      />
                    </div>
                    <div class="mb-3">
                      <label for="reg-password" class="form-label">Palavra-passe</label>
                      <input
                        type="password"
                        class="form-control"
                        id="reg-password"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                      />
                    </div>
                    <div id="register-error" class="alert alert-danger d-none py-2 small"></div>
                    <button type="submit" class="btn btn-primary w-100">
                      <i class="fa-solid fa-user-plus me-1"></i>Criar conta
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>`;

    this.#el = wrapper.firstElementChild;
    document.body.appendChild(this.#el);

    this.#el.querySelector("#form-login").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = this.#el.querySelector("#login-email").value;
      const password = this.#el.querySelector("#login-password").value;
      this.#onLogin(email, password, (msg) =>
        this.#showError("login-error", msg)
      );
    });

    this.#el.querySelector("#form-register").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = this.#el.querySelector("#reg-username").value;
      const email = this.#el.querySelector("#reg-email").value;
      const password = this.#el.querySelector("#reg-password").value;
      this.#onRegister(username, email, password, (msg) =>
        this.#showError("register-error", msg)
      );
    });
  }

  #showError(id, message) {
    const el = this.#el.querySelector(`#${id}`);
    if (!el) return;
    el.textContent = message;
    el.classList.remove("d-none");
  }

  #clearErrors() {
    this.#el.querySelectorAll(".alert").forEach((el) => {
      el.textContent = "";
      el.classList.add("d-none");
    });
  }

  #getModal() {
    if (!this.#modal) {
      this.#modal = new Modal(this.#el);
    }
    return this.#modal;
  }

  show(tab = "login") {
    this.#clearErrors();
    if (tab === "register") {
      this.#el.querySelector("#tab-register").click();
    } else {
      this.#el.querySelector("#tab-login").click();
    }
    this.#getModal().show();
  }

  hide() {
    this.#getModal().hide();
  }
}
