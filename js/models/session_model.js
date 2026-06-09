import { User } from "../user.js";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getSessionUser,
  setSessionUser,
} from "../api.js";

const ADMIN_NAME = "admin";
const ADMIN_PASSWORD = "lexis123";

export class SessionModel {
  async initSession() {
    const user = await getSessionUser();
    if (!user) await this.startAnonymousSession();
  }

  async startAnonymousSession() {
    const guest = new User({ id: crypto.randomUUID(), isAnonymous: true });
    const created = await createUser(guest);
    await setSessionUser(created);
    return created;
  }

  async getSession() {
    return await getSessionUser();
  }

  async logout() {
    await this.startAnonymousSession();
  }

  async login(identifier, password) {
    if (!identifier || !password)
      return { ok: false, error: "Fill in all fields." };
    if (identifier === ADMIN_NAME && password === ADMIN_PASSWORD) {
      const adminUser = await getUser("admin");
      if (adminUser) {
        adminUser.isAdmin = true;
        await setSessionUser(adminUser);
        return { ok: true, user: adminUser };
      }
    }
    const users = await getUsers();
    const user = users.find(
      (u) =>
        (u.email === identifier || u.name === identifier) &&
        u.password === password,
    );
    if (!user) return { ok: false, error: "Invalid email or password." };
    await setSessionUser(user);
    return { ok: true, user };
  }

  async createAccount({ name, email, password }) {
    if (!name || !email || !password)
      return { ok: false, error: "Fill in all fields." };
    const users = await getUsers();
    if (users.find((u) => u.email === email))
      return { ok: false, error: "Email already in use." };
    const newUser = new User({
      id: crypto.randomUUID(),
      name,
      email,
      password,
    });
    const created = await createUser(newUser);
    await setSessionUser(created);
    return { ok: true, user: created };
  }

  async convertGuestToAccount({ name, email, password }) {
    if (!name || !email || !password)
      return { ok: false, error: "Fill in all fields." };
    const users = await getUsers();
    if (users.find((u) => u.email === email))
      return { ok: false, error: "Email already in use." };
    const guest = await this.getSession();
    const newUser = new User({
      id: crypto.randomUUID(),
      name,
      email,
      password,
    });
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
      if (guest?.isAnonymous) {
        await deleteUser(guest.id);
      }
    }
    const created = await createUser(newUser);
    await setSessionUser(created);
    return { ok: true, user: created };
  }

  async getAllUsers() {
    return await getUsers();
  }

  async deleteUser(userId) {
    await deleteUser(userId);
  }

  async updateUserStat(userId, field, value) {
    const user = await getUser(userId);
    if (!user) return false;
    user[field] = parseInt(value) || 0;
    if (field === "xp") {
      user.level = Math.floor(user.xp / 200) + 1;
      const titles = [
        "",
        "Explorer",
        "Adventurer",
        "Scholar",
        "Wizard",
        "Master",
        "Legend",
      ];
      user.currentTitle =
        titles[Math.min(user.level, titles.length - 1)] || "Legend";
    }
    await updateUser(userId, user);
    return true;
  }

  async updateUser(user) {
    await setSessionUser(user);
    if (!user.isAnonymous) {
      try {
        await updateUser(user.id, user);
      } catch {
        await createUser(user);
      }
    }
  }

  async recordDailyActivity() {
    const user = await this.getSession();
    if (!user) return false;

    const today = new Date().toISOString().slice(0, 10);

    if (user.lastActiveDate === today) return false;

    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
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
    await this.updateUser(user);

    return {
      streak: user.streak,
      isNewRecord,
      isMilestone: user.streak > 0 && user.streak % 7 === 0,
    };
  }
}
