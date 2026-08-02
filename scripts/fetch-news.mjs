/**
 * scripts/fetch-news.mjs
 *
 * 抓取 NHK News Web Easy 最新的幾則新聞，擷取「開頭一小段摘要」
 * （刻意不抓整篇全文——避免整篇重製他人新聞內容的版權疑慮，
 *  完整內容一律附上連結導回 NHK 官方頁面），
 * 再呼叫 Claude API 針對這段摘要做「重點單字／文法」分析，
 * 最後把結果寫回 src/news/articles.json，交給 GitHub Actions 定期執行。
 *
 * 本機測試： ANTHROPIC_API_KEY=xxx npm run fetch-news
 * （沒有設定 ANTHROPIC_API_KEY 時，仍會抓新聞，只是不會有單字／文法分析）
 *
 * 注意：NHK 的頁面結構、JSON 端點日後可能會調整，
 * 若抓取失敗，請先用瀏覽器打開 NHK_LIST_URL / 文章網址確認目前的實際結構，
 * 再對照調整下面的 CSS selector。
 */

import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import path from "node:path";
import dns from "node:dns";
import { fileURLToPath } from "node:url";

// 修正：Node.js 在部分雲端 CI 環境（例如 GitHub Actions）預設會優先嘗試 IPv6，
// 若目標主機的 IPv6 連線不通就會整個卡住逾時（ETIMEDOUT）。強制優先用 IPv4 可解決大多數這類問題。
dns.setDefaultResultOrder("ipv4first");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "../src/news/articles.json");

const NHK_LIST_URL = "https://www3.nhk.or.jp/news/easy/news-list.json";
const MAX_ARTICLES = 5;
const EXCERPT_SENTENCES = 2; // 只取前幾句當摘要，不抓整篇全文
const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = "claude-sonnet-4-6"; // 依需求可換成其他可用的 Claude 模型

/* ---------------- 帶逾時＋重試的 fetch，並印出詳細診斷訊息 ---------------- */

async function fetchWithRetry(url, options = {}, label = url) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      console.log(`  → 抓取 ${label}（第 ${attempt} 次嘗試）`);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      console.warn(`  ⚠️  ${label} 第 ${attempt} 次失敗：${err.message}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1500)); // 逐次拉長等待時間再重試
      }
    }
  }
  throw new Error(`${label} 重試 ${MAX_RETRIES} 次後仍失敗：${lastErr?.message}`);
}


/* ---------------- 抓新聞列表 ---------------- */

async function fetchNewsList() {
  const res = await fetchWithRetry(
    NHK_LIST_URL,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; MichinoriBot/1.0)" } },
    "news-list.json"
  );
  if (!res.ok) throw new Error(`news-list.json 取得失敗：HTTP ${res.status}`);
  const raw = await res.json();

  // news-list.json 的結構大致是「依日期分組的陣列」，把新聞攤平成單一陣列
  const flat = [];
  for (const group of raw) {
    for (const key of Object.keys(group)) {
      if (Array.isArray(group[key])) flat.push(...group[key]);
    }
  }
  return flat.slice(0, MAX_ARTICLES);
}

/* ---------------- 抓單篇文章內容，並把 NHK 自帶的 ruby 假名
   轉成我們前端用的 "漢字[讀音]" 標記格式 ---------------- */

function nodeToBracketText($, el) {
  let out = "";
  $(el)
    .contents()
    .each((_, child) => {
      if (child.type === "text") {
        out += child.data;
      } else if (child.tagName === "ruby") {
        const $ruby = $(child);
        const reading = $ruby.find("rt").first().text().trim();
        const base = $ruby.clone().find("rt,rp").remove().end().text().trim();
        out += reading ? `${base}[${reading}]` : base;
      } else {
        out += nodeToBracketText($, child);
      }
    });
  return out;
}

function splitSentences(text) {
  return text
    .split("。")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `${s}。`);
}

async function fetchArticleExcerpt(newsId) {
  const url = `https://www3.nhk.or.jp/news/easy/${newsId}/${newsId}.html`;
  const res = await fetchWithRetry(
    url,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; MichinoriBot/1.0)" } },
    `文章 ${newsId}`
  );
  if (!res.ok) throw new Error(`文章頁面取得失敗：HTTP ${res.status}（${url}）`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // NHK Easy 文章內文常見容器 id，若改版請對照實際頁面調整
  const bodyEl = $("#js-article-body, .article-main__body, #article-body").first();
  const bracketText = nodeToBracketText($, bodyEl.get(0) || $("body").get(0));
  const sentences = splitSentences(bracketText);
  const excerpt = sentences.slice(0, EXCERPT_SENTENCES).join("");

  return { excerpt, url };
}

/* ---------------- 呼叫 Claude API 分析單字／文法 ---------------- */

async function analyzeWithClaude(excerptPlain) {
  if (!ANTHROPIC_API_KEY) {
    console.warn("⚠️  未設定 ANTHROPIC_API_KEY，略過單字／文法分析。");
    return { vocab: [], grammar: [] };
  }

  const prompt = `請分析以下這段日文新聞摘要，用於日文學習App。
只回傳「純JSON」，不要任何說明文字、不要markdown code block。
JSON格式：
{
  "vocab": [{ "word": "漢字", "reading": "假名讀音", "zh": "繁體中文意思" }],
  "grammar": [{ "pattern": "文法句型", "note": "用繁體中文簡短說明這個句型的用法" }]
}
挑選4-6個對N5-N3學習者有幫助的重點單字，2-3個文法句型。

日文原文：
${excerptPlain}`;

  const res = await fetchWithRetry(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    },
    "Claude API"
  );

  if (!res.ok) {
    console.error("Claude API 分析失敗：", res.status, await res.text());
    return { vocab: [], grammar: [] };
  }

  const data = await res.json();
  const text = data.content.map((b) => b.text || "").join("\n");
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Claude 回傳的內容無法解析為 JSON：", text);
    return { vocab: [], grammar: [] };
  }
}

/* ---------------- 主流程 ---------------- */

async function main() {
  console.log("抓取 NHK News Web Easy 最新新聞列表…");
  const list = await fetchNewsList();
  console.log(`取得 ${list.length} 則新聞，開始逐篇處理…`);

  const articles = [];
  for (const item of list) {
    try {
      const newsId = item.news_id;
      const { excerpt, url } = await fetchArticleExcerpt(newsId);
      if (!excerpt) {
        console.warn(`⚠️  ${newsId} 沒有抓到內文，略過`);
        continue;
      }

      const plainExcerpt = excerpt.replace(/\[[^\]]+\]/g, "");
      const analysis = await analyzeWithClaude(plainExcerpt);

      articles.push({
        id: `nhk-${newsId}`,
        date: (item.news_prearranged_time || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
        title: item.title || "",
        titleZh: "", // 如需中文標題翻譯，可另外擴充 analyzeWithClaude 一併請 Claude 翻譯
        body: [excerpt],
        bodyZh: "",
        sourceUrl: url,
        vocab: analysis.vocab || [],
        grammar: analysis.grammar || [],
      });
      console.log(`✅ ${newsId} 處理完成`);
    } catch (err) {
      console.error(`❌ 處理 ${item.news_id} 時發生錯誤：`, err.message);
    }
  }

  if (articles.length === 0) {
    console.warn("這次沒有成功抓到任何新聞，保留原本的 articles.json 不覆寫。");
    return;
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(articles, null, 2) + "\n", "utf8");
  console.log(`已寫入 ${articles.length} 篇新聞到 ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("執行失敗：", err);
  process.exit(1);
});
