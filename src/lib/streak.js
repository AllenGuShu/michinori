// 連續使用天數 — 使用瀏覽器 localStorage，每天第一次打開/使用 App 時記錄一次。

const STORAGE_KEY = "michinori-streak";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
  } catch (e) {
    return { count: 0, lastDate: null };
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    /* 略過儲存失敗 */
  }
}

// 呼叫時機：App 掛載時呼叫一次即可，會自動判斷今天是否已經記錄過
export function recordActivity() {
  const data = load();
  const today = todayStr();

  if (data.lastDate === today) {
    return data; // 今天已經記錄過，不重複累加
  }

  if (data.lastDate === yesterdayStr()) {
    data.count += 1; // 昨天有來，今天也來 → 連續天數 +1
  } else {
    data.count = 1; // 中斷過，或第一次使用 → 重新從 1 開始
  }
  data.lastDate = today;
  save(data);
  return data;
}

export function getStreak() {
  return load();
}
