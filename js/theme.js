const callbacks = [];
const observer = new MutationObserver(() => callbacks.forEach((fn) => fn()));
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-bs-theme"],
});

export function onThemeChange(callback) {
  callbacks.push(callback);
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
}

export function getTheme() {
  return document.documentElement.getAttribute("data-bs-theme");
}

export function assetUrl(path) {
  const base = import.meta.env.BASE_URL || "";
  return base + path;
}
