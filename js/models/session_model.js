import { User } from "../user.js";

const USERS_KEY = "lexis_users";
const SESSION_KEY = "lexis_session";
const ADMIN_NAME = "admin";
const ADMIN_PASSWORD = "lexis123";

export class SessionModel {
  #getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  }

  #saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  #saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  initSession() {
    if (!localStorage.getItem(SESSION_KEY)) this.startAnonymousSession();
  }

  startAnonymousSession() {
    const guest = new User({ id: crypto.randomUUID(), isAnonymous: true });
    this.#saveSession(guest);
    return guest;
  }

  getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  }

  logout() {
    this.startAnonymousSession();
  }

  login(identifier, password) {
    if (!identifier || !password)
      return { ok: false, error: "Fill in all fields." };
    if (identifier === ADMIN_NAME && password === ADMIN_PASSWORD) {
      const adminUser = new User({ id: "admin", name: ADMIN_NAME, isAnonymous: false });
      adminUser.isAdmin = true;
      adminUser.xp = 99999;
      adminUser.coins = 99999;
      adminUser.level = Math.floor(adminUser.xp / 200) + 1;
      adminUser.currentTitle = "Legend";
      this.#saveSession(adminUser);
      return { ok: true, user: adminUser };
    }
    const user = this.#getUsers().find(
      (u) =>
        (u.email === identifier || u.name === identifier) &&
        u.password === password,
    );
    if (!user) return { ok: false, error: "Invalid email or password." };
    this.#saveSession(user);
    return { ok: true, user };
  }

  createAccount({ name, email, password }) {
    if (!name || !email || !password)
      return { ok: false, error: "Fill in all fields." };
    const users = this.#getUsers();
    if (users.find((u) => u.email === email))
      return { ok: false, error: "Email already in use." };
    const newUser = new User({
      id: crypto.randomUUID(),
      name,
      email,
      password,
    });
    users.push(newUser);
    this.#saveUsers(users);
    this.#saveSession(newUser);
    return { ok: true, user: newUser };
  }

  convertGuestToAccount({ name, email, password }) {
    if (!name || !email || !password)
      return { ok: false, error: "Fill in all fields." };
    const users = this.#getUsers();
    if (users.find(u => u.email === email))
      return { ok: false, error: "Email already in use." };
    const guest = this.getSession();
    const newUser = new User({ id: crypto.randomUUID(), name, email, password });
    if (guest) {
      newUser.xp = guest.xp || 0;
      newUser.coins = guest.coins || 0;
      newUser.solvedSheets = guest.solvedSheets || [];
      newUser.currentTitle = guest.currentTitle || "Explorer";
      newUser.level = guest.level || 1;
      newUser.streak = guest.streak || 0;
      newUser.longestStreak = guest.longestStreak || 0;
      newUser.lastActiveDate = guest.lastActiveDate || null;
      newUser.hardcoreBest = guest.hardcoreBest || 0;
      newUser.avatar = guest.avatar || {};
      newUser.purchasedStoreItems = guest.purchasedStoreItems || [];
      newUser.theme = guest.theme || "light";
      newUser.adaptText = guest.adaptText;
    }
    users.push(newUser);
    this.#saveUsers(users);
    this.#saveSession(newUser);
    return { ok: true, user: newUser };
  }

  getAllUsers() {
    return this.#getUsers();
  }

  deleteUser(userId) {
    const users = this.#getUsers();
    const filtered = users.filter(u => u.id !== userId);
    if (filtered.length < users.length) {
      this.#saveUsers(filtered);
      return true;
    }
    return false;
  }

  updateUserStat(userId, field, value) {
    const users = this.#getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user[field] = parseInt(value) || 0;
    if (field === "xp") {
      user.level = Math.floor(user.xp / 200) + 1;
      const titles = ["", "Explorer", "Adventurer", "Scholar", "Wizard", "Master", "Legend"];
      user.currentTitle = titles[Math.min(user.level, titles.length - 1)] || "Legend";
    }
    this.#saveUsers(users);
    const session = this.getSession();
    if (session && session.id === userId) {
      session[field] = user[field];
      if (field === "xp") {
        session.level = user.level;
        session.currentTitle = user.currentTitle;
      }
      this.#saveSession(session);
    }
    document.body.dispatchEvent(new CustomEvent("user:updated"));
    return true;
  }

  updateUser(user) {
    this.#saveSession(user);
    if (!user.isAnonymous) {
      const users = this.#getUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
        this.#saveUsers(users);
      }
    }
    document.body.dispatchEvent(new CustomEvent("user:updated"));
  }

  recordDailyActivity() {
    const user = this.getSession();
    if (!user) return false;

    const today = new Date().toISOString().slice(0, 10);

    if (user.lastActiveDate === today) return false;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let isNewRecord = false;

    if (user.lastActiveDate === yesterday) {
      user.streak += 1;
      if (user.streak > (user.longestStreak || 0)) {
        user.longestStreak = user.streak;
        isNewRecord = true;
      }
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = today;
    this.updateUser(user);

    return { streak: user.streak, isNewRecord, isMilestone: user.streak > 0 && user.streak % 7 === 0 };
  }
}
