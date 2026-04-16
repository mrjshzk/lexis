import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";
import { SvgStringToImg } from "../utils.js";

export class NavbarView {
  #el;
  #onAuthClick;
  #onLogoutClick;

  constructor({ onAuthClick, onLogoutClick }) {
    this.#onAuthClick = onAuthClick;
    this.#onLogoutClick = onLogoutClick;
    this.#el = document.createElement("nav");
    document.body.prepend(this.#el);
  }

  render(session) {
    const avatar = createAvatar(lorelei, { seed: session.avatarSeed });
    const avatarSrc = SvgStringToImg(avatar.toString());

    this.#el.className =
      "navbar navbar-expand-lg bg-body-tertiary shadow-sm py-3";

    this.#el.innerHTML = `
      <div class="container">
        <a class="navbar-brand fw-bold fs-3 text-primary" href="#">
          <i class="fa-solid fa-puzzle-piece text-warning"></i> Lexis
        </a>
        <div class="d-flex align-items-center gap-3">
          <div class="status-badge text-warning" title="Moedas para o Avatar">
            <i class="fa-solid fa-coins"></i>
            <span id="nav-coins">${session.coins}</span>
          </div>
          <div class="status-badge text-info" title="Pontos de Experiência">
            <i class="fa-solid fa-star"></i>
            <span id="nav-xp">${session.xp}</span> XP
          </div>
          ${
            session.isLoggedIn
              ? `<span class="text-body-secondary small d-none d-md-inline fw-semibold">
                   <i class="fa-solid fa-user me-1"></i>${session.username}
                 </span>
                 <button id="btn-logout" class="btn btn-outline-secondary btn-sm">
                   <i class="fa-solid fa-right-from-bracket me-1"></i>Sair
                 </button>`
              : `<button id="btn-auth" class="btn btn-primary btn-sm">
                   <i class="fa-solid fa-right-to-bracket me-1"></i>Entrar
                 </button>`
          }
          <div class="ms-1">
            <img
              id="nav-avatar"
              src="${avatarSrc}"
              alt="O teu Avatar"
              class="rounded-circle bg-body border border-2 border-primary"
              width="50"
              height="50"
              style="cursor:pointer"
              title="${session.isLoggedIn ? session.username : "Visitante anónimo"}"
            />
          </div>
        </div>
      </div>`;

    this.#el
      .querySelector("#btn-auth")
      ?.addEventListener("click", this.#onAuthClick);
    this.#el
      .querySelector("#btn-logout")
      ?.addEventListener("click", this.#onLogoutClick);
  }
}
