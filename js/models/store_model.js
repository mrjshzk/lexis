const CATALOG = {
  eyes: [
    { id: "eyes_normal", name: "Normal", value: "normal", price: 0 },
    { id: "eyes_cheery", name: "Cheery", value: "cheery", price: 0 },
    { id: "eyes_angry", name: "Angry", value: "angry", price: 10 },
    { id: "eyes_confused", name: "Confused", value: "confused", price: 10 },
    { id: "eyes_sad", name: "Sad", value: "sad", price: 15 },
    { id: "eyes_sleepy", name: "Sleepy", value: "sleepy", price: 15 },
    { id: "eyes_starstruck", name: "Starstruck", value: "starstruck", price: 20 },
    { id: "eyes_winking", name: "Winking", value: "winking", price: 20 },
  ],
  mouth: [
    { id: "mouth_awkwardSmile", name: "Awkward Smile", value: "awkwardSmile", price: 0 },
    { id: "mouth_braces", name: "Braces", value: "braces", price: 0 },
    { id: "mouth_gapSmile", name: "Gap Smile", value: "gapSmile", price: 10 },
    { id: "mouth_kawaii", name: "Kawaii", value: "kawaii", price: 20 },
    { id: "mouth_openedSmile", name: "Opened Smile", value: "openedSmile", price: 10 },
    { id: "mouth_openSad", name: "Open Sad", value: "openSad", price: 10 },
    { id: "mouth_teethSmile", name: "Teeth Smile", value: "teethSmile", price: 15 },
    { id: "mouth_unimpressed", name: "Unimpressed", value: "unimpressed", price: 15 },
  ],
  hair: [
    { id: "hair_straightHair", name: "Straight", value: "straightHair", price: 0 },
    { id: "hair_shortHair", name: "Short", value: "shortHair", price: 0 },
    { id: "hair_bangs", name: "Bangs", value: "bangs", price: 10 },
    { id: "hair_bowlCutHair", name: "Bowl Cut", value: "bowlCutHair", price: 15 },
    { id: "hair_braids", name: "Braids", value: "braids", price: 20 },
    { id: "hair_bunHair", name: "Bun", value: "bunHair", price: 15 },
    { id: "hair_curlyBob", name: "Curly Bob", value: "curlyBob", price: 15 },
    { id: "hair_curlyShortHair", name: "Curly Short", value: "curlyShortHair", price: 10 },
    { id: "hair_froBun", name: "Fro Bun", value: "froBun", price: 25 },
    { id: "hair_halfShavedHead", name: "Half Shaved", value: "halfShavedHead", price: 25 },
    { id: "hair_mohawk", name: "Mohawk", value: "mohawk", price: 25 },
    { id: "hair_shavedHead", name: "Shaved", value: "shavedHead", price: 10 },
    { id: "hair_wavyBob", name: "Wavy Bob", value: "wavyBob", price: 15 },
  ],
  skinColor: [
    { id: "skin_8c5a2b", name: "Dark Brown", value: "8c5a2b", price: 0 },
    { id: "skin_643d19", name: "Brown", value: "643d19", price: 0 },
    { id: "skin_a47539", name: "Medium Brown", value: "a47539", price: 0 },
    { id: "skin_c99c62", name: "Tan", value: "c99c62", price: 0 },
    { id: "skin_e2ba87", name: "Light Tan", value: "e2ba87", price: 0 },
    { id: "skin_efcc9f", name: "Peach", value: "efcc9f", price: 0 },
    { id: "skin_f5d7b1", name: "Light Peach", value: "f5d7b1", price: 0 },
    { id: "skin_ffe4c0", name: "Fair", value: "ffe4c0", price: 0 },
  ],
  hairColor: [
    { id: "hairCol_3a1a00", name: "Dark Brown", value: "3a1a00", price: 0 },
    { id: "hairCol_220f00", name: "Black", value: "220f00", price: 0 },
    { id: "hairCol_71472d", name: "Medium Brown", value: "71472d", price: 0 },
    { id: "hairCol_d56c0c", name: "Auburn", value: "d56c0c", price: 0 },
    { id: "hairCol_e2ba87", name: "Blonde", value: "e2ba87", price: 10 },
    { id: "hairCol_238d80", name: "Teal", value: "238d80", price: 10 },
    { id: "hairCol_605de4", name: "Purple", value: "605de4", price: 15 },
    { id: "hairCol_e9b729", name: "Gold", value: "e9b729", price: 15 },
  ],
  accessories: [
    { id: "acc_none", name: "None", value: "none", price: 0 },
    { id: "acc_glasses", name: "Glasses", value: "glasses", price: 15 },
    { id: "acc_sunglasses", name: "Sunglasses", value: "sunglasses", price: 15 },
    { id: "acc_catEars", name: "Cat Ears", value: "catEars", price: 20 },
    { id: "acc_clownNose", name: "Clown Nose", value: "clownNose", price: 10 },
    { id: "acc_mustache", name: "Mustache", value: "mustache", price: 20 },
    { id: "acc_sailormoonCrown", name: "Sailor Crown", value: "sailormoonCrown", price: 25 },
    { id: "acc_faceMask", name: "Face Mask", value: "faceMask", price: 10 },
    { id: "acc_sleepMask", name: "Sleep Mask", value: "sleepMask", price: 15 },
  ],
  backgroundColor: [
    { id: "bg_transparent", name: "Transparent", value: "transparent", price: 0 },
    { id: "bg_lightBlue", name: "Light Blue", value: "c0aede", price: 0 },
    { id: "bg_pink", name: "Pink", value: "ffdfbf", price: 5 },
    { id: "bg_green", name: "Green", value: "c0ebdf", price: 5 },
    { id: "bg_yellow", name: "Yellow", value: "ffd5dc", price: 5 },
    { id: "bg_purple", name: "Purple", value: "d1d4f9", price: 5 },
  ],
};

const DEFAULT_AVATAR = {
  eyes: "cheery",
  mouth: "braces",
  hair: "straightHair",
  skinColor: "a47539",
  hairColor: "238d80",
  accessories: [],
  backgroundColor: "transparent",
};

const FREE_ITEM_IDS = Object.values(CATALOG)
  .flat()
  .filter((item) => item.price === 0)
  .map((item) => item.id);

export class StoreModel {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
  }

  getCatalog() {
    return CATALOG;
  }

  async getUser() {
    return await this.sessionModel.getSession();
  }

  async getCoins() {
    const user = await this.getUser();
    return user ? user.coins : 0;
  }

  getDefaultAvatar() {
    return { ...DEFAULT_AVATAR, accessories: [...DEFAULT_AVATAR.accessories] };
  }

  async getEquipped() {
    const user = await this.getUser();
    if (!user || !user.avatar || Object.keys(user.avatar).length === 0) {
      return this.getDefaultAvatar();
    }
    return user.avatar;
  }

  async getPurchased() {
    const user = await this.getUser();
    if (!user) return [...FREE_ITEM_IDS];
    return [...FREE_ITEM_IDS, ...(user.purchasedStoreItems || [])];
  }

  async isOwned(itemId) {
    const purchased = await this.getPurchased();
    return purchased.includes(itemId);
  }

  getItemById(itemId) {
    return Object.values(CATALOG).flat().find(i => i.id === itemId) ?? null;
  }

  getItemCategory(itemId) {
    const entry = Object.entries(CATALOG).find(([_, items]) =>
      items.some(i => i.id === itemId)
    );
    return entry ? entry[0] : null;
  }

  async purchase(itemId) {
    const item = this.getItemById(itemId);
    if (!item) return { ok: false, error: "Item not found." };

    if (await this.isOwned(itemId)) return { ok: false, error: "Already owned." };

    const user = await this.getUser();
    if (!user) return { ok: false, error: "No active session." };

    if (user.coins < item.price) return { ok: false, error: "Not enough coins." };

    user.coins -= item.price;
    if (!user.purchasedStoreItems) user.purchasedStoreItems = [];
    user.purchasedStoreItems.push(itemId);
    await this.sessionModel.updateUser(user);

    return { ok: true, user };
  }

  async equip(category, value) {
    const user = await this.getUser();
    if (!user) return { ok: false, error: "No active session." };

    if (!user.avatar || Object.keys(user.avatar).length === 0) {
      user.avatar = this.getDefaultAvatar();
    }

    if (category === "accessories") {
      if (value === "none") {
        user.avatar.accessories = [];
      } else {
        user.avatar.accessories = [value];
      }
    } else {
      user.avatar[category] = value;
    }

    await this.sessionModel.updateUser(user);
    return { ok: true, user };
  }
}
