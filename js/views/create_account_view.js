export class CreateAccountView {
  #sessionModel;
  #savedHtml = "";

  #render = () => {
    const main = document.getElementById("main-container");
    if (!main) return;
    this.#savedHtml = main.innerHTML;
    main.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 py-5 px-3">
        <div class="card rounded-4 shadow border-0 p-4 w-100 lexis-card-sm">
          <h3 class="text-center fw-normal mb-4 lexis-heading-sm">Create an account</h3>
          <form id="create-account-form">
            <div class="mb-3"><label for="ca-name" class="form-label mb-1">Username</label><input type="text" id="ca-name" class="form-control rounded-4 py-2" required /></div>
            <div class="mb-3"><label for="ca-email" class="form-label mb-1">Email</label><input type="email" id="ca-email" class="form-control rounded-4 py-2" required /></div>
            <div class="mb-4"><label for="ca-password" class="form-label mb-1">Password</label><input type="password" id="ca-password" class="form-control rounded-4 py-2" required /></div>
            <p id="ca-error" class="alert alert-danger py-2" style="display: none;"></p>
            <button type="submit" class="btn w-100 rounded-4 py-2 mb-2 text-white lexis-btn-primary fw-medium">Confirm</button>
            <button type="button" id="ca-skip" class="btn w-100 rounded-4 py-2 mb-2 lexis-btn-undo fw-medium">Continue without an account</button>
            <button type="button" id="ca-back-btn" class="btn w-100 rounded-4 py-2 lexis-btn-undo fw-medium">Back</button>
          </form>
        </div>
      </div>`;
    document.getElementById("ca-skip").onclick = () => {
      window.location.href = import.meta.env.BASE_URL + "html/dashboard.html";
    };
    document.getElementById("ca-back-btn").onclick = () => {
      main.innerHTML = this.#savedHtml;
      main.dispatchEvent(new CustomEvent("index:render"));
    };
    document.getElementById("create-account-form").onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById("ca-name").value.trim();
      const email = document.getElementById("ca-email").value.trim();
      const password = document.getElementById("ca-password").value;
      this.#sessionModel.createAccount({ name, email, password }).then((r) => {
        if (!r.ok) {
          const err = document.getElementById("ca-error");
          err.textContent = r.error;
          err.style.display = "block";
        } else {
          window.location.href =
            import.meta.env.BASE_URL + "html/dashboard.html";
        }
      });
    };
  };

  attachTrigger() {
    document
      .querySelectorAll("[data-trigger='register']")
      .forEach((el) => el.addEventListener("click", this.#render));
  }
  constructor(sessionModel) {
    this.#sessionModel = sessionModel;
    this.attachTrigger();
  }
}
