import { LoginView } from "./views/login_view.js";
import { CreateAccountView } from "./views/create_account_view.js";
import { SessionModel } from "./models/session_model.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { onThemeChange, setTheme, getTheme, assetUrl } from "./theme.js";

const sessionModel = new SessionModel();

(async () => {
  await sessionModel.initSession();

  const savedUser = await sessionModel.getSession();
  const savedTheme = (savedUser && savedUser.theme) || "light";
  document.documentElement.setAttribute("data-bs-theme", savedTheme);

  function updateNavLogo() {
    const logo = document.querySelector("#navbar-logo");
    if (!logo) return;
    logo.src =
      getTheme() === "dark"
        ? assetUrl("assets/img/LogoOrange.png")
        : assetUrl("assets/img/LogoBlue.png");
  }

  function updateThemeIcon() {
    document
      .querySelectorAll(".theme-icon")
      .forEach((el) => (el.textContent = getTheme() === "dark" ? "🌙" : "☀️"));
  }

  function syncToggleState() {
    document
      .querySelectorAll(".theme-toggle-input")
      .forEach((el) => (el.checked = getTheme() === "dark"));
  }

  updateNavLogo();
  updateThemeIcon();
  syncToggleState();

  onThemeChange(updateNavLogo);
  onThemeChange(updateThemeIcon);
  onThemeChange(syncToggleState);

  const teaserBtn = document.querySelector("#teaser-btn");
  const teaserOverlay = document.querySelector("#teaser-overlay");
  const teaserVideo = document.querySelector("#teaser-overlay-video");
  const teaserClose = document.querySelector(".teaser-overlay-close");

  if (teaserBtn && teaserOverlay && teaserVideo && teaserClose) {
    teaserBtn.addEventListener("click", () => {
      teaserOverlay.classList.remove("d-none");
      teaserVideo.play();
    });

    function closeTeaser() {
      teaserOverlay.classList.add("d-none");
      teaserVideo.pause();
      teaserVideo.currentTime = 0;
    }

    teaserClose.addEventListener("click", closeTeaser);
    teaserOverlay.addEventListener("click", (e) => {
      if (e.target === teaserOverlay) closeTeaser();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !teaserOverlay.classList.contains("d-none"))
        closeTeaser();
    });
  }

  document.querySelectorAll(".theme-toggle-input").forEach((el) => {
    el.addEventListener("change", async () => {
      setTheme(el.checked ? "dark" : "light");
      const user = await sessionModel.getSession();
      if (user) {
        user.theme = getTheme();
        await sessionModel.updateUser(user);
      }
    });
  });

  const loginView = new LoginView(sessionModel);
  const createAccountView = new CreateAccountView(sessionModel);

  document
    .getElementById("main-container")
    .addEventListener("index:render", () => {
      loginView.attachTrigger();
      createAccountView.attachTrigger();
    });
})();
