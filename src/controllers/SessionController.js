import { Session, SESSION_TYPES } from "../models/Session.js";
import { User } from "../models/User.js";
import { AuthService } from "../services/AuthService.js";
import { StorageService } from "../services/StorageService.js";

export class SessionController {
  #session = null;
  #listeners = [];

  constructor() {
    this.#loadOrCreate();
  }

  get session() {
    return this.#session;
  }

  get isLoggedIn() {
    return this.#session?.isLoggedIn ?? false;
  }

  #loadOrCreate() {
    const saved = StorageService.getSession();
    if (saved) {
      this.#session = new Session(saved);
    } else {
      this.#session = Session.createAnonymous();
      this.#persist();
    }
  }

  #persist() {
    StorageService.saveSession(this.#session.toPlainObject());
  }

  #notify() {
    this.#listeners.forEach((fn) => fn(this.#session));
  }

  onChange(fn) {
    this.#listeners.push(fn);
  }

  login(email, password) {
    const user = AuthService.login(email, password);
    this.#session = Session.fromUser(user);
    this.#persist();
    this.#notify();
    return this.#session;
  }

  register(username, email, password) {
    const user = AuthService.register(username, email, password);
    this.#session = Session.fromUser(user);
    this.#persist();
    this.#notify();
    return this.#session;
  }

  logout() {
    this.#session = Session.createAnonymous();
    this.#persist();
    this.#notify();
  }

  completeWorksheet(worksheetId, xpReward) {
    const alreadyCompleted = this.#session.hasCompletedWorksheet(worksheetId);
    this.#session.completeWorksheet(worksheetId);

    if (!alreadyCompleted) {
      this.#session.addXP(xpReward);

      if (this.#session.isLoggedIn) {
        const users = StorageService.getUsers();
        const idx = users.findIndex((u) => u.id === this.#session.userId);
        if (idx !== -1) {
          const user = new User(users[idx]);
          user.completeWorksheet(worksheetId);
          user.addXP(xpReward);
          users[idx] = user.toPlainObject();
          StorageService.saveUsers(users);
        }
      }
    }

    this.#persist();
    this.#notify();
    return !alreadyCompleted;
  }
}
