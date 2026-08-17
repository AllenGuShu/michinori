// 已分析新聞的個人資料庫 — 存在瀏覽器 localStorage，累積式儲存

const STORAGE_KEY = "michinori-news-archive";

export function loadArchive() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function persist(archive) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
  } catch (e) {
    /* 儲存失敗（例如容量已滿）時略過 */
  }
}

export function saveArticle(article) {
  const archive = loadArchive();
  const next = [article, ...archive];
  persist(next);
  return next;
}

export function deleteArticle(id) {
  const next = loadArchive().filter((a) => a.id !== id);
  persist(next);
  return next;
}
