export class User {
  constructor({
    id,
    username,
    email,
    password,
    xp,
    coins,
    level,
    completedWorksheets,
    avatarSeed,
  } = {}) {
    this.id = id ?? crypto.randomUUID();
    this.username = username ?? "";
    this.email = email ?? "";
    this.password = password ?? "";
    this.xp = xp ?? 0;
    this.coins = coins ?? 0;
    this.level = level ?? 1;
    this.completedWorksheets = completedWorksheets ?? [];
    this.avatarSeed = avatarSeed ?? this.id;
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
}
