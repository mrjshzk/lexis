import { isMuted, setMuted } from "../sound.js";

export class SettingsView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    document.querySelectorAll('[data-tab="settings"]').forEach((btn) => {
      btn.onclick = () => this.render();
    });
  }

  async render() {
    if (window.setActiveTab) window.setActiveTab("settings");
    const user = (await this.sessionModel.getSession()) || {};
    const currentTheme = user.theme || "light";
    const adaptText = user.adaptText || false;
    const soundMuted = isMuted();

    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center w-100 lexis-min-h-full">
        <div class="rounded-4 shadow-sm p-4 w-100 lexis-card-sm">
          <div class="d-flex justify-content-between align-items-center mb-5">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-medium">Adapt text</span>
              <label class="form-check form-switch mb-0" style="min-height: 1.5rem; padding-left: 2.5rem;">
                <input class="form-check-input lexis-toggle" type="checkbox" id="adapt-text-toggle"
                  ${adaptText ? "checked" : ""}>
              </label>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fw-medium">Sound</span>
              <label class="form-check form-switch mb-0" style="min-height: 1.5rem; padding-left: 2.5rem;">
                <input class="form-check-input lexis-toggle" type="checkbox" id="sound-toggle"
                  ${!soundMuted ? "checked" : ""}>
              </label>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="lexis-sun-icon">☀️</span>
              <label class="form-check form-switch mb-0" style="min-height: 1.5rem; padding-left: 2.5rem;">
                <input class="form-check-input lexis-toggle" type="checkbox" id="dark-mode-toggle"
                  ${currentTheme === "dark" ? "checked" : ""}>
              </label>
            </div>
          </div>

          <h5 class="text-center fw-normal mb-4">Edit Profile</h5>

          <form id="settings-form">
            <div class="mb-3">
              <label for="settings-username" class="form-label">Username</label>
              <input type="text" id="settings-username" class="form-control rounded-4 py-2"
                value="${user.name || ""}" required />
            </div>
            <div class="mb-3">
              <label for="settings-email" class="form-label">Email</label>
              <input type="email" id="settings-email" class="form-control rounded-4 py-2"
                value="${user.email || ""}" required />
            </div>
            <div class="mb-4">
              <label for="settings-password" class="form-label">Password</label>
              <input type="password" id="settings-password" class="form-control rounded-4 py-2"
                value="${user.password || ""}" required />
            </div>
            <p id="settings-error" class="alert alert-danger py-2" style="display: none;"></p>
            <button type="submit" class="btn text-white w-100 rounded-4 py-2 lexis-btn-primary">Apply Changes</button>
          </form>
        </div>
      </div>`;

    const adaptToggle = mainContainer.querySelector("#adapt-text-toggle");
    adaptToggle.addEventListener("change", async () => {
      user.adaptText = adaptToggle.checked;
      await this.sessionModel.updateUser(user);
      document.body.classList.toggle("dyslexic-mode", adaptToggle.checked);
    });

    const soundToggle = mainContainer.querySelector("#sound-toggle");
    if (soundToggle) {
      soundToggle.addEventListener("change", () => {
        setMuted(!soundToggle.checked);
      });
    }

    const themeToggle = mainContainer.querySelector("#dark-mode-toggle");
    themeToggle.addEventListener("change", async () => {
      const theme = themeToggle.checked ? "dark" : "light";
      user.theme = theme;
      await this.sessionModel.updateUser(user);
      document.documentElement.setAttribute("data-bs-theme", theme);
    });

    mainContainer
      .querySelector("#settings-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = mainContainer
          .querySelector("#settings-username")
          .value.trim();
        const newEmail = mainContainer
          .querySelector("#settings-email")
          .value.trim();
        const newPassword =
          mainContainer.querySelector("#settings-password").value;

        if (!newName || !newEmail || !newPassword) {
          const err = mainContainer.querySelector("#settings-error");
          err.textContent = "Fill in all fields.";
          err.style.display = "block";
          return;
        }

        user.name = newName;
        user.email = newEmail;
        user.password = newPassword;
        await this.sessionModel.updateUser(user);
        mainContainer.dispatchEvent(new CustomEvent("avatar:updated"));

        const err = mainContainer.querySelector("#settings-error");
        err.className = "alert alert-success py-2";
        err.textContent = "Changes applied successfully.";
        err.style.display = "block";
        setTimeout(() => {
          err.style.display = "none";
          err.className = "alert alert-danger py-2";
        }, 2000);
      });
  }
}
