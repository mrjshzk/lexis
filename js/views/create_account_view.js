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
            <div class="mb-4"><label for="ca-password" class="form-label mb-1">Password</label><div class="position-relative"><input type="password" id="ca-password" class="form-control rounded-4 py-2 pe-5" required /><button type="button" class="btn p-0 position-absolute end-0 top-50 translate-middle-y me-3 border-0 bg-transparent" style="z-index:5;line-height:1;font-size:1.2rem;" onclick="togglePasswordVisibility('ca-password',this)"><i class="bi bi-eye"></i></button></div></div>
            <p id="ca-error" class="alert alert-danger py-2" style="display: none;"></p>
            <button type="submit" class="btn w-100 rounded-4 py-2 mb-2 text-white lexis-btn-primary fw-medium">Confirm</button>
            <button type="button" id="ca-skip" class="btn w-100 rounded-4 py-2 mb-2 lexis-btn-undo fw-medium">Continue without an account</button>
            <button type="button" id="ca-back-btn" class="btn w-100 rounded-4 py-2 lexis-btn-undo fw-medium">Back</button>
          </form>
        </div>
      </div>`;
    document.getElementById("ca-skip").onclick = () => { window.location.href = import.meta.env.BASE_URL + "html/dashboard.html"; };
    document.getElementById("ca-back-btn").onclick = () => { main.innerHTML = this.#savedHtml; main.dispatchEvent(new CustomEvent("index:render")); };
    document.getElementById("create-account-form").onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById("ca-name").value.trim();
      const email = document.getElementById("ca-email").value.trim();
      const password = document.getElementById("ca-password").value;
      const r = await this.#sessionModel.createAccount({ name, email, password });
      if (!r.ok) { const err = document.getElementById("ca-error"); err.textContent = r.error; err.style.display = "block"; }
      else window.location.href = import.meta.env.BASE_URL + "html/dashboard.html";
    };
  };

  attachTrigger() { document.querySelectorAll("[data-trigger='register']").forEach(el => el.addEventListener("click", this.#render)); }
  constructor(sessionModel) { this.#sessionModel = sessionModel; this.attachTrigger(); }
}
