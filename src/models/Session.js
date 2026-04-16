export const SESSION_TYPES = Object.freeze({
  ANONYMOUS: "anonymous",
  LOGGED_IN: "logged_in",
});

export class Session {
  constructor({
    type,
    userId,
    username,
    xp,
    coins,
    level,
    completedWorksheets,
    avatarSeed,
  } = {}) {
    this.type = type ?? SESSION_TYPES.ANONYMOUS;
    this.userId = userId ?? null;
    this.username = username ?? "Anónimo";
    this.xp = xp ?? 0;
    this.coins = coins ?? 0;
    this.level = level ?? 1;
    this.completedWorksheets = completedWorksheets ?? [];
    this.avatarSeed = avatarSeed ?? crypto.randomUUID();
  }

  get isLoggedIn() {
    return this.type === SESSION_TYPES.LOGGED_IN;
  }

  get isAnonymous() {
    return this.type === SESSION_TYPES.ANONYMOUS;
  }

  addXP(amount) {
    this.xp += amount;
    this.level = Math.floor(this.xp / 100) + 1;
    return this;
  }

  addCoins(amount) {
    this.coins += amount;
    return this;
  }

  completeWorksheet(worksheetId) {
    if (!this.completedWorksheets.includes(worksheetId)) {
      this.completedWorksheets.push(worksheetId);
    }
    return this;
  }

  hasCompletedWorksheet(worksheetId) {
    return this.completedWorksheets.includes(worksheetId);
  }

  toPlainObject() {
    return { ...this };
  }

  static fromUser(user) {
    return new Session({
      type: SESSION_TYPES.LOGGED_IN,
      userId: user.id,
      username: user.username,
      xp: user.xp,
      coins: user.coins,
      level: user.level,
      completedWorksheets: user.completedWorksheets,
      avatarSeed: user.avatarSeed,
    });
  }

  static createAnonymous() {
    return new Session({
      type: SESSION_TYPES.ANONYMOUS,
      avatarSeed: crypto.randomUUID(),
    });
  }
}
