import { getExerciseContainer } from "../utils.js";

export default class DragBaseView {
  constructor(model, container) {
    this.model = model;
    this.container = container;
    this.dragState = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  _getContainer() {
    return getExerciseContainer(this);
  }

  _attachDrag(container, selector) {
    container
      .querySelectorAll(selector)
      .forEach((el) => el.addEventListener("pointerdown", this._onPointerDown));
  }

  _onPointerDown(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect(); // retorna rect com tamanho e posição do elemento relativo à viewport
    const clone = el.cloneNode(true);
    clone.classList.add("lexis-drag-clone");
    clone.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;pointer-events:none;z-index:9999;transition:none;box-shadow:0 8px 24px rgba(0,0,0,0.15);transform:scale(1.08);white-space:nowrap;`;
    document.body.appendChild(clone);
    el.classList.add("opacity-25");
    this.dragState = {
      el,
      clone,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      originalParent: el.parentNode,
      originalRef: el.nextSibling,
      moved: false,
    };
    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerup", this._onPointerUp);
  }

  _onPointerMove(e) {
    if (!this.dragState) return;
    const ds = this.dragState;
    ds.clone.style.left = e.clientX - ds.offsetX + "px";
    ds.clone.style.top = e.clientY - ds.offsetY + "px";
    if (
      !ds.moved &&
      (Math.abs(e.clientX - ds.startX) > 5 ||
        Math.abs(e.clientY - ds.startY) > 5)
    )
      ds.moved = true;
  }

  _onPointerUp(e) {
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerup", this._onPointerUp);
    if (!this.dragState) return;
    const ds = this.dragState;
    ds.clone.remove();
    ds.el.classList.remove("opacity-25");
    if (ds.moved) this._onDrop(ds.el, e);
    this.dragState = null;
  }

  _onDrop(el, e) {
    throw new Error("_onDrop must be implemented by subclass");
  }
}
