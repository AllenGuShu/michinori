// 間隔複習（SRS）— 使用瀏覽器 localStorage 儲存，免費、不需要後端。
// 規則：字卡標「不熟」→ 2 天後在「今日複習」重新出現；標「記得」→ 從佇列移除。

const STORAGE_KEY = "michinori-review-queue";

export function loadQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    // 無痕模式或瀏覽器不支援 localStorage 時，安全地回傳空佇列
    return {};
  }
}

export function saveQueue(queue) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    /* 儲存失敗（例如容量已滿）時略過，不影響當次使用 */
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function scheduleMiss(queue, cardId) {
  return { ...queue, [cardId]: { nextDate: addDaysStr(2) } };
}

export function clearCard(queue, cardId) {
  if (!queue[cardId]) return queue;
  const next = { ...queue };
  delete next[cardId];
  return next;
}

export function getDueDeck(allVocab, queue) {
  const today = todayStr();
  return allVocab.filter((v) => queue[v.id] && queue[v.id].nextDate <= today);
}
