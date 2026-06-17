import { SessionModel } from "./models/session_model.js";
import { celebrate, showLevelUp } from "./effects.js";
import { ensureAudioContext, playLevelUp } from "./sound.js";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { LevelsView } from "./views/levels_view.js";
import { PdfView } from "./views/pdf_view.js";
import { ShopView } from "./views/shop_view.js";
import { SettingsView } from "./views/settings_view.js";
import { AdminView } from "./views/admin_view.js";
import { onThemeChange, assetUrl } from "./theme.js";

const sessionModel = new SessionModel();

const DEFAULT_AVATAR_OPTIONS = {
  eyes: ["cheery"],
  mouth: ["braces"],
  hair: ["straightHair"],
  skinColor: ["a47539"],
  hairColor: ["238d80"],
  accessories: [],
  accessoriesProbability: 0,
  backgroundColor: ["transparent"],
  size: 128,
};

function getAvatarOptions(user) {
  if (user && user.avatar && Object.keys(user.avatar).length > 0) {
    const opts = { ...DEFAULT_AVATAR_OPTIONS };
    for (const [key, val] of Object.entries(user.avatar)) {
      const arr = Array.isArray(val) ? val : [val];
      if (key === "accessories") {
        opts.accessories = arr;
        opts.accessoriesProbability = arr.length > 0 ? 100 : 0;
      } else {
        opts[key] = arr;
      }
    }
    return opts;
  }
  return DEFAULT_AVATAR_OPTIONS;
}

function setImg(id, src) {
  const el = document.querySelector(id);
  if (el) el.src = src;
}

function setText(id, val) {
  const el = document.querySelector(id);
  if (el) el.textContent = val;
}

function setBar(id, pct) {
  const el = document.querySelector(id);
  if (el) el.style.width = `${pct}%`;
}

function showAvatarFullscreen(avatarSrc) {
  const overlay = document.createElement("div");
  overlay.className = "lexis-levelup-overlay";
  overlay.innerHTML = `
    <div class="lexis-avatar-fullscreen-card">
      <img src="${avatarSrc}" alt="User avatar" class="lexis-avatar-fullscreen">
    </div>`;
  overlay.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
}

async function refreshSidebar() {
  const user = await sessionModel.getSession();
  if (!user) return;

  const avatarSrc = createAvatar(bigSmile, getAvatarOptions(user)).toDataUri();
  setImg("#user-avatar", avatarSrc);
  setImg("#user-avatar-mobile", avatarSrc);

  setText("#user-name", user.name);
  setText("#user-name-mobile", user.name);

  setText("#user-level", `Level ${user.level} ${user.currentTitle}`);
  setText("#user-level-mobile", `Lv.${user.level}`);

  setText("#user-stats-level", user.level);
  setText("#user-stats-xp", user.xp);
  setText("#user-stats-coins", user.coins);
  setText("#user-xp-mobile", user.xp);
  setText("#user-coins-mobile", user.coins);

  const xpPct = Math.min(Math.round(((user.xp % 200) / 200) * 100), 100);
  setBar("#daily-xp-bar", xpPct);
  setText("#daily-xp-text", `${xpPct}%`);

  const coinPct = Math.min(Math.round((user.coins / 100) * 100), 100);
  setBar("#daily-coins-bar", coinPct);
  setText("#daily-coins-text", `${coinPct}%`);

  const flame = document.querySelector("#streak-flame");
  if (flame) flame.style.opacity = user.streak > 0 ? "1" : "0.4";
  setText("#streak-count", user.streak);
  setText("#streak-best", user.longestStreak);

  document
    .querySelectorAll(
      "[data-tab='store'], [data-tab='customization'], [data-tab='pdf']",
    )
    .forEach((btn) => {
      btn.classList.toggle("d-none", user.isAnonymous);
    });
  document.querySelectorAll(".restricted-admin-tab").forEach((btn) => {
    btn.classList.toggle("d-none", !user.isAdmin);
  });
}

(async () => {
  const session = await sessionModel.getSession();

  const savedTheme = (session && session.theme) || "light";
  document.documentElement.setAttribute("data-bs-theme", savedTheme);

  function updateLogo() {
    const logo = document.querySelector("#sidebar-logo");
    if (!logo) return;
    logo.src =
      document.documentElement.getAttribute("data-bs-theme") === "dark"
        ? assetUrl("assets/img/LogoOrange.png")
        : assetUrl("assets/img/LogoBlue.png");
  }
  updateLogo();
  onThemeChange(updateLogo);

  if (session?.adaptText) {
    document.body.classList.add("dyslexic-mode");
  }

  window.setActiveTab = (tab) => {
    document.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.classList.remove("lexis-nav-btn-active");
    });
    if (tab) {
      document.querySelectorAll(`[data-tab="${tab}"]`).forEach((btn) => {
        btn.classList.add("lexis-nav-btn-active");
      });
    }
  };

  await refreshSidebar();

  const mainContainer = document.querySelector("#main-container");
  window.mainContainer = mainContainer;

  const levelsView = new LevelsView(sessionModel);
  const pdfView = new PdfView(sessionModel);
  const shopView = new ShopView(sessionModel);
  const settingsView = new SettingsView(sessionModel);
  const adminView = new AdminView(sessionModel);
  await levelsView.render();

  const logo = document.querySelector("#sidebar-logo");
  if (logo) {
    logo.addEventListener("click", () => {
      window.setActiveTab(null);
      levelsView.render();
    });
  }

  const homeBtn = document.querySelector("#btn-levels-mobile");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.setActiveTab(null);
      levelsView.render();
    });
  }

  document.getElementById("user-avatar")?.addEventListener("click", () => {
    const src = document.getElementById("user-avatar").src;
    showAvatarFullscreen(src);
  });
  document
    .getElementById("user-avatar-mobile")
    ?.addEventListener("click", () => {
      const src = document.getElementById("user-avatar-mobile").src;
      showAvatarFullscreen(src);
    });

  mainContainer.addEventListener("worksheet:cancel", () => {
    window.setActiveTab(null);
    refreshSidebar();
    levelsView.render();
  });

  mainContainer.addEventListener("avatar:updated", () => {
    refreshSidebar();
  });

  const STREAK_MILESTONES = [7, 14, 21, 30, 60, 100];
  document.body.addEventListener("streak:updated", (e) => {
    refreshSidebar();
    const { streak, isNewRecord } = e.detail;
    if (streak > 0 && STREAK_MILESTONES.includes(streak)) {
      setTimeout(() => celebrate(), 300);
    }
  });

  document.body.addEventListener("level:up", (e) => {
    const { level, title } = e.detail;
    showLevelUp(level, title);
    playLevelUp();
  });

  document.addEventListener("click", () => ensureAudioContext(), {
    once: true,
  });
})();
