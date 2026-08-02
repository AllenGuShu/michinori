// 簡易 Levenshtein 編輯距離，用來粗略比對語音辨識結果跟目標句子的相似度
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// 回傳 0～1 的相似度分數（1 = 完全相同）
export function similarity(a, b) {
  const cleanA = (a || "").replace(/[\s、。！？「」]/g, "");
  const cleanB = (b || "").replace(/[\s、。！？「」]/g, "");
  const maxLen = Math.max(cleanA.length, cleanB.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(cleanA, cleanB);
  return Math.max(0, 1 - dist / maxLen);
}
