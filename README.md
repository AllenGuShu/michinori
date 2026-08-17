# ニュース手帳 — 新聞日文分析

上傳你每天看的新聞截圖，自動辨識文字、加上假名標註、整理重點單字與文法，
並額外造出「生活情境」「旅遊情境」的延伸例句，累積成專屬的個人新聞學習資料庫。

## 專案結構

```
michinori/
├── api/
│   └── analyze-news.js   Vercel Serverless Function，伺服器端呼叫 Claude API 做圖片分析
├── src/
│   ├── App.jsx             主應用（標題列 + 深色模式 + 新聞分析）
│   ├── components/
│   │   └── NewsAnalyzer.jsx  上傳截圖、顯示分析結果、管理已存的新聞清單
│   └── lib/
│       ├── furigana.jsx     假名標註渲染
│       ├── newsArchive.js   已分析新聞的本機資料庫（localStorage）
│       ├── speak.js         瀏覽器語音朗讀
│       ├── streak.js        連續使用天數
│       └── theme.js         深色模式偏好設定
└── package.json
```

## 本機開發

```bash
npm install
npm run dev
```

⚠️ `api/analyze-news.js` 是 Vercel Serverless Function，本機 `npm run dev` 沒辦法直接測試這個功能
（會呼叫失敗），只有部署到 Vercel 之後才能正常運作。

## 部署到 Vercel

1. 推上 GitHub（`git add . && git commit -m "..." && git push`，或用 GitHub Desktop）
2. Vercel 匯入這個 repo，直接 Deploy（會自動偵測 Vite 專案 + `/api` 資料夾）
3. **重要**：到 Vercel 專案 → Settings → Environment Variables，新增：
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的 Anthropic API Key（去 [console.anthropic.com](https://console.anthropic.com) 申請）
4. 存檔後如果網站已經部署過，需要重新部署一次讓環境變數生效（Vercel 的 Deployments 頁面 → 右上角選單 → Redeploy）

## 資料儲存

已分析的新聞存在使用者瀏覽器的 `localStorage`，換裝置、換瀏覽器、清除瀏覽器資料都會重新開始，
沒有跨裝置同步。之後如果想要「手機、電腦進度互通」，需要加上資料庫，是比較大的功能，有需要再討論。
