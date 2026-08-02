// 已學習清單 — 使用瀏覽器 localStorage 儲存，記錄使用者確定學會的單字與文法。

const STORAGE_KEY = "michinori-learned";

export function loadLearned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return { vocab: data.vocab || {}, grammar: data.grammar || {} };
  } catch (e) {
    return { vocab: {}, grammar: {} };
  }
}

function saveLearned(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    /* 儲存失敗時略過，不影響當次使用 */
  }
}

// type 是 "vocab" 或 "grammar"
export function markLearned(type, id) {
  const data = loadLearned();
  data[type] = { ...data[type], [id]: true };
  saveLearned(data);
  return data;
}

export function unmarkLearned(type, id) {
  const data = loadLearned();
  if (data[type] && data[type][id]) {
    const next = { ...data[type] };
    delete next[id];
    data[type] = next;
    saveLearned(data);
  }
  return data;
}

export function isLearned(type, id) {
  const data = loadLearned();
  return !!(data[type] && data[type][id]);
}
