export class User {
  constructor({ id, name, email, password, isAnonymous = false }) {
    this.id = id;
    this.name = name ?? "Guest";
    this.email = email ?? null;
    this.password = password ?? null;
    this.isAnonymous = isAnonymous;
    this.xp = 0;
    this.coins = 0;
    this.solvedSheets = [];
    this.streak = 0;
    this.longestStreak = 0;
    this.lastActiveDate = null;
    this.avatar = {};
    this.purchasedStoreItems = [];
    this.currentTitle = "Explorer";
    this.level = 1;
    this.theme = "light";
    this.soundMuted = false;
    this.adaptText = false;
    this.hardcoreBest = 0;
    this.isAdmin = false;
  }
}
