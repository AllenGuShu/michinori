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

// 彙整所有已分析新聞裡的單字，同一個字只保留第一次出現的那筆
export function getAllVocab() {
  const archive = loadArchive();
  const map = new Map();
  archive.forEach((a) => {
    (a.vocab || []).forEach((v) => {
      if (!map.has(v.word)) {
        map.set(v.word, { ...v, sourceTitle: a.title, sourceDate: a.date });
      }
    });
  });
  return Array.from(map.values());
}

// 彙整所有已分析新聞裡的文法句型，同一個句型只保留第一次出現的那筆
export function getAllGrammar() {
  const archive = loadArchive();
  const map = new Map();
  archive.forEach((a) => {
    (a.grammar || []).forEach((g) => {
      if (!map.has(g.pattern)) {
        map.set(g.pattern, { ...g, sourceTitle: a.title, sourceDate: a.date });
      }
    });
  });
  return Array.from(map.values());
}
