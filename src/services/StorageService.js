const KEYS = Object.freeze({
  USERS: "lexis_users",
  SESSION: "lexis_session",
  WORKSHEETS: "lexis_worksheets",
});

export class StorageService {
  static #parse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static get(key) {
    const raw = localStorage.getItem(key);
    return raw !== null ? StorageService.#parse(raw) : null;
  }

  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static getUsers() {
    return StorageService.get(KEYS.USERS) ?? [];
  }

  static saveUsers(users) {
    StorageService.set(KEYS.USERS, users);
  }

  static getSession() {
    return StorageService.get(KEYS.SESSION);
  }

  static saveSession(session) {
    StorageService.set(KEYS.SESSION, session);
  }

  static clearSession() {
    StorageService.remove(KEYS.SESSION);
  }

  static getWorksheets() {
    return StorageService.get(KEYS.WORKSHEETS) ?? [];
  }

  static saveWorksheets(worksheets) {
    StorageService.set(KEYS.WORKSHEETS, worksheets);
  }
}
