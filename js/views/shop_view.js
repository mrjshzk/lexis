import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import { StoreModel } from "../models/store_model.js";

const STORE_CATS = [
  "hair",
  "hairColor",
  "eyes",
  "mouth",
  "accessories",
  "backgroundColor",
];
const CUSTOM_CATS = [
  "skinColor",
  "hair",
  "hairColor",
  "eyes",
  "mouth",
  "accessories",
  "backgroundColor",
];

const LABELS = {
  skinColor: "Skin Color",
  hair: "Hair",
  hairColor: "Hair Color",
  eyes: "Eyes",
  mouth: "Mouth",
  accessories: "Accessories",
  backgroundColor: "Background Color",
};

const PROMPT = {
  store:
    "You can buy things to customize your avatar with your in game coins here!",
  customize: "You can customize your avatar here!",
};

function avatarDataUri(options, size = 80) {
  return createAvatar(bigSmile, { ...options, size }).toDataUri();
}

function equippedToOptions(equipped) {
  return {
    eyes: [equipped.eyes],
    mouth: [equipped.mouth],
    hair: [equipped.hair],
    skinColor: [equipped.skinColor],
    hairColor: [equipped.hairColor],
    accessories: equipped.accessories || [],
    accessoriesProbability: (equipped.accessories || []).length > 0 ? 100 : 0,
    backgroundColor: equipped.backgroundColor
      ? [equipped.backgroundColor]
      : ["transparent"],
  };
}

function itemThumbOptions(equipped, category, value) {
  const opts = equippedToOptions(equipped);
  if (category === "accessories") {
    if (value === "none") {
      opts.accessories = [];
      opts.accessoriesProbability = 0;
    } else {
      opts.accessories = [value];
      opts.accessoriesProbability = 100;
    }
  } else if (category === "backgroundColor") {
    opts.backgroundColor = [value];
  } else {
    opts[category] = [value];
  }
  return opts;
}

export class ShopView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    this.storeModel = new StoreModel(sessionModel);
    this.mode = "store";
    this.activeCategory = "hair";
    document.querySelectorAll('[data-tab="store"]').forEach((btn) => {
      btn.onclick = () => {
        this.mode = "store";
        this.activeCategory = "hair";
        this.render();
      };
    });
    document.querySelectorAll('[data-tab="customization"]').forEach((btn) => {
      btn.onclick = () => {
        this.mode = "customize";
        this.activeCategory = "skinColor";
        this.render();
      };
    });
  }

  _categories() {
    return this.mode === "store" ? STORE_CATS : CUSTOM_CATS;
  }
  _tab() {
    return this.mode === "customize" ? "customization" : "store";
  }

  _isEquipped(item, equipped) {
    if (this.activeCategory === "accessories") {
      if (item.value === "none")
        return (equipped.accessories || []).length === 0;
      return (equipped.accessories || []).includes(item.value);
    }
    if (this.activeCategory === "backgroundColor")
      return equipped.backgroundColor === item.value;
    return equipped[this.activeCategory] === item.value;
  }

  async render() {
    if (window.setActiveTab) window.setActiveTab(this._tab());

    const mc = document.querySelector("#main-container");
    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center py-4 w-100">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100 lexis-prompt-bar lexis-contained">${PROMPT[this.mode]}</div>
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-4" id="shop-categories">
          ${this._categories()
            .map(
              (k) => `
            <button class="btn btn-sm rounded-pill px-3 py-1 ${k === this.activeCategory ? "lexis-tab-active" : "lexis-tab-inactive"}" data-category="${k}">${LABELS[k]}</button>
          `,
            )
            .join("")}
        </div>
        <div class="d-flex flex-wrap gap-3 justify-content-center lexis-contained" id="shop-items-grid">${await this._renderItems()}</div>
      </div>`;
    this._wireEvents();
  }

  async _renderItems() {
    const catalog = this.storeModel.getCatalog();
    const items = catalog[this.activeCategory] || [];
    const purchased = await this.storeModel.getPurchased();
    const equipped = await this.storeModel.getEquipped();
    const user = await this.sessionModel.getSession();
    const coins = user?.coins ?? 0;

    const filtered =
      this.mode === "customize"
        ? items.filter((i) => purchased.includes(i.id))
        : items;
    if (this.mode === "customize" && !filtered.length) {
      return '<p class="text-muted text-center py-3">No owned items in this category. Visit the store to purchase items.</p>';
    }

    return filtered
      .map((item) => {
        const owned = purchased.includes(item.id);
        const isEquipped = this._isEquipped(item, equipped);
        const itemClass = isEquipped
          ? "lexis-item-equipped"
          : "lexis-item-card";

        let thumb;
        if (this.activeCategory === "backgroundColor") {
          const c =
            item.value === "transparent"
              ? "var(--lexis-bg-card)"
              : `#${item.value}`;
          const b =
            item.value === "transparent"
              ? "2px dashed var(--lexis-border-dashed)"
              : "none";
          thumb = `<div class="lexis-thumb-bg d-flex align-items-center justify-content-center mx-auto" style="background:${c};border:${b};">${isEquipped ? '<span style="color:var(--lexis-primary);font-size:1.2rem;">✓</span>' : ""}</div>`;
        } else if (
          this.activeCategory === "skinColor" ||
          this.activeCategory === "hairColor"
        ) {
          const dc = isEquipped
            ? "var(--lexis-primary)"
            : "var(--lexis-border)";
          thumb = `<div class="lexis-thumb-circle d-flex align-items-center justify-content-center mx-auto" style="background:#${item.value};border:2px solid ${dc};"></div>`;
        } else {
          const src = avatarDataUri(
            itemThumbOptions(equipped, this.activeCategory, item.value),
            70,
          );
          const bs = isEquipped
            ? "3px solid var(--lexis-primary)"
            : "2px solid var(--lexis-border)";
          thumb = `<img src="${src}" class="lexis-thumb-img mx-auto" alt="${item.name}" style="border:${bs};" />`;
        }

        if (this.mode === "store") {
          const cantAfford = !owned && item.price > coins;
          const extraStyle = cantAfford
            ? "opacity:0.45;pointer-events:none;"
            : "";
          const price = owned
            ? '<div class="small lexis-text-green mt-2">Owned</div>'
            : `<div class="lexis-price-label py-1 px-2 text-center mt-2">${item.price > 0 ? item.price + " coins" : "Free"}</div>`;
          const ca =
            owned || cantAfford
              ? ""
              : `onclick="this.dispatchEvent(new CustomEvent('shop:buy',{bubbles:true,detail:'${item.id}'}))"`;
          return `<div class="rounded-4 shadow-sm p-3 text-center ${itemClass} ${!owned && !cantAfford ? "cursor-pointer" : ""}" style="${extraStyle}" ${ca}>${thumb}${price}</div>`;
        }

        return `<div class="rounded-4 shadow-sm p-3 text-center ${itemClass} lexis-clickable" data-action="equip" data-category="${this.activeCategory}" data-value="${item.value}">${thumb}</div>`;
      })
      .join("");
  }

  _wireEvents() {
    document.querySelectorAll("#shop-categories button").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeCategory = btn.dataset.category;
        this.render();
      });
    });

    const grid = document.querySelector("#shop-items-grid");
    if (!grid) return;

    if (this.mode === "store") {
      grid.addEventListener("shop:buy", async (e) => {
        const r = await this.storeModel.purchase(e.detail);
        if (r.ok) {
          const item = this.storeModel.getItemById(e.detail);
          if (item)
            await this.storeModel.equip(
              this.storeModel.getItemCategory(e.detail),
              item.value,
            );
          document
            .querySelector("#main-container")
            .dispatchEvent(new CustomEvent("avatar:updated"));
          this.render();
        } else {
          const d = document.createElement("div");
          d.className = "alert alert-danger rounded-4 py-2 px-3 position-fixed";
          d.style.cssText = "top:1rem;right:1rem;z-index:9999;";
          d.textContent = r.error;
          document.body.appendChild(d);
          setTimeout(() => d.remove(), 2000);
        }
      });
    } else {
      grid.addEventListener("click", async (e) => {
        const card = e.target.closest("[data-action='equip']");
        if (!card) return;
        await this.storeModel.equip(card.dataset.category, card.dataset.value);
        document
          .querySelector("#main-container")
          .dispatchEvent(new CustomEvent("avatar:updated"));
        this.render();
      });
    }
  }
}
