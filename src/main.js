import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { SessionController } from "./controllers/SessionController.js";
import { WorksheetController } from "./controllers/WorksheetController.js";
import { NavbarView } from "./views/NavbarView.js";
import { HomeView } from "./views/HomeView.js";
import { AuthView } from "./views/AuthView.js";
import { WorksheetView } from "./views/WorksheetView.js";

// ── Controllers ────────────────────────────────────────────────────────────────
const sessionController = new SessionController();
const worksheetController = new WorksheetController(sessionController);

// ── Shared container for the main views ────────────────────────────────────────
const mainContent = document.getElementById("main-content");

// ── View state ─────────────────────────────────────────────────────────────────
// 'home' | 'worksheets' | 'exercise'
let currentView = "home";

// ── Views ──────────────────────────────────────────────────────────────────────
const navbarView = new NavbarView({
  onAuthClick: () => authView.show("login"),
  onLogoutClick: () => {
    sessionController.logout();
    currentView = "home";
    renderMain();
  },
});

const authView = new AuthView({
  onLogin: (email, password, onError) => {
    try {
      sessionController.login(email, password);
      authView.hide();
      currentView = "home";
      renderMain();
    } catch (err) {
      onError(err.message);
    }
  },
  onRegister: (username, email, password, onError) => {
    try {
      sessionController.register(username, email, password);
      authView.hide();
      currentView = "home";
      renderMain();
    } catch (err) {
      onError(err.message);
    }
  },
});

const homeView = new HomeView({
  container: mainContent,
  onNormalMode: () => {
    currentView = "worksheets";
    renderMain();
  },
  onShowAuth: (tab) => authView.show(tab),
});

const worksheetView = new WorksheetView({
  container: mainContent,
  onBack: () => {
    currentView = "worksheets";
    renderMain();
  },
  onComplete: (worksheetId) => {
    worksheetController.completeWorksheet(worksheetId);
    navbarView.render(sessionController.session);
  },
  onRequestWorksheet: (wsId) => {
    const worksheet = worksheetController.getWorksheet(wsId);
    if (!worksheet) return;
    currentView = "exercise";
    navbarView.render(sessionController.session);
    worksheetView.renderWorksheet(worksheet);
  },
});

// ── Session change handler ─────────────────────────────────────────────────────
sessionController.onChange((session) => {
  navbarView.render(session);
  // Re-render main content only for stable views (not mid-exercise)
  if (currentView !== "exercise") {
    renderMain();
  }
});

// ── Render helpers ─────────────────────────────────────────────────────────────
function renderMain() {
  navbarView.render(sessionController.session);

  if (currentView === "home") {
    homeView.render(sessionController.session);
  } else if (currentView === "worksheets") {
    worksheetView.renderList(
      worksheetController.getWorksheets(),
      sessionController.session
    );
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────────
renderMain();
