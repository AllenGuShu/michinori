// 深色模式偏好設定 — 存在 localStorage，預設跟隨系統設定

const STORAGE_KEY = "michinori-theme";

export function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch (e) {
    /* 略過 */
  }
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    /* 略過 */
  }
}
