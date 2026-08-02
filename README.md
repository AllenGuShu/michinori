# みちのり — 通勤日文學習

通勤時間學旅遊日文：單字閃卡（含假名標註＋文法重點）、文法測驗、間隔複習（SRS）、情境會話、時事新聞。

## 專案結構

```
michinori/
├── src/
│   ├── data/          單字、文法、情境會話資料
│   ├── news/           news/articles.json（新聞資料，會被自動排程覆寫）
│   ├── lib/            假名標註、語音朗讀、間隔複習(SRS) 工具
│   ├── components/     各功能區塊元件
│   ├── App.jsx          主應用
│   └── main.jsx          進入點
├── scripts/
│   └── fetch-news.mjs    NHK Easy 新聞抓取＋Claude API 分析腳本
├── .github/workflows/
│   └── update-news.yml   每日自動更新新聞的排程
└── package.json
```

---

## 一、本機開發

```bash
npm install
npm run dev
```

打開瀏覽器看到的網址（通常是 http://localhost:5173）就是本機預覽。

---

## 二、上架到 Vercel（免費、任何人都能用）

### Step 1：把專案推上 GitHub

1. 去 [github.com/new](https://github.com/new) 建立一個新的 repository（Public 或 Private 都可以，Vercel 免費方案兩種都支援）
2. 在這個專案資料夾內執行：
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/你的帳號/你的repo名稱.git
   git push -u origin main
   ```

### Step 2：在 Vercel 匯入專案

1. 去 [vercel.com](https://vercel.com)，用 GitHub 帳號登入
2. 點「Add New」→「Project」
3. 選擇剛剛推上去的 repo，Vercel 會自動偵測到這是 Vite 專案（Framework Preset 會自動選 "Vite"，Build Command 是 `vite build`，Output Directory 是 `dist`，通常不用改）
4. 點「Deploy」，等 1-2 分鐘

完成後你會拿到一個免費網址，例如 `michinori.vercel.app`，這個網址任何人都可以打開使用，完全免費，Vercel 的 Hobby（個人）方案本來就是給這種專案用的，沒有使用人數限制。

之後只要你 `git push` 到 GitHub 的 main 分支，Vercel 就會自動重新部署最新版本，不需要手動操作。

### （選用）綁自己的網域

如果之後想要用自己買的網域（例如 `michinori.tw`）而不是 `xxx.vercel.app`，在 Vercel 專案的 Settings → Domains 加進去、照指示改網域商的 DNS 設定即可，這一步 Vercel 本身不額外收費（網域本身是另外跟網域商購買的）。

---

## 三、設定新聞自動更新（NHK Easy 新聞 + AI 分析）

新聞區目前 `src/news/articles.json` 裡放的是**示範文章**（我自己寫的，不是真的 NHK 新聞）。要接上真實新聞的自動更新，照下面步驟做：

### Step 1：申請 Anthropic API Key

1. 去 [console.anthropic.com](https://console.anthropic.com) 註冊帳號（如果還沒有的話）
2. 建立一組 API Key（注意：這跟你平常用的 claude.ai 訂閱是分開的，API 是依用量計費，但這個新聞分析腳本每天只呼叫幾次、內容也很短，費用非常低，一個月大概幾十元台幣等級）

### Step 2：把 API Key 加到 GitHub Secrets

1. 到你的 GitHub repo 頁面 → Settings → Secrets and variables → Actions
2. 點「New repository secret」
3. Name 填 `ANTHROPIC_API_KEY`，Value 貼上你剛剛申請的 key
4. 儲存

### Step 3：確認排程有沒有正常運作

`.github/workflows/update-news.yml` 已經設定好「每天台灣時間早上 7 點自動執行」，你也可以手動測試：

1. 到 GitHub repo 頁面 → Actions 分頁
2. 左邊選「更新旅遊日文新聞」
3. 點右邊「Run workflow」手動觸發一次
4. 執行完成後，去看 `src/news/articles.json` 有沒有被自動 commit 更新內容
5. Vercel 偵測到新的 commit 後會自動重新部署，網站上的新聞區就會換成最新內容

### 這個新聞功能的重要說明（版權考量）

抓取腳本刻意**只擷取每篇新聞開頭一小段**（2 句左右）當作學習用的摘要，而不是整篇轉載，並且每篇文章都附上連結導回 NHK 官方頁面。這是為了避免大量重製他人新聞內容的版權疑慮。如果你想放更完整的內容，會建議之後改成「摘要＋單字文法解析＋強烈導引使用者點連結去 NHK 官網讀全文」這種模式，而不是把全文整篇複製過來公開給大家看。

另外 NHK 的網頁結構未來可能會調整，如果哪天腳本抓不到新聞了，去 `scripts/fetch-news.mjs` 裡對照 NHK Easy 目前的實際頁面結構，調整裡面的 CSS selector（有寫註解說明在哪裡改）。

---

## 四、間隔複習（SRS）功能說明

字卡標「不熟」後，會存進瀏覽器的 `localStorage`（`src/lib/srs.js`），2 天後在「今日複習」分頁會重新出現，答對就從清單移除。

**這是存在使用者自己瀏覽器裡的資料**，換裝置、換瀏覽器、清除瀏覽器資料都會重新開始，沒有跨裝置同步。如果之後想要「手機、電腦進度互通」，需要加上帳號系統＋資料庫（例如免費的 Supabase），這是比較大的功能，之後有需要可以再討論怎麼加。

---

## 五、之後想繼續擴充可以怎麼做

- 想加新單字/文法/會話內容：直接編輯 `src/data/` 底下的 `.js` 檔案，儲存後 `git push` 就會自動上線
- 想改顏色、字型、版面：改 `src/App.jsx` 裡 `<style>` 區塊的 CSS 變數（`--ai`、`--kaki` 等）
- 想加新功能區塊：在 `src/components/` 新增元件，再到 `src/App.jsx` 裡加一個分頁按鈕和對應的渲染邏輯

朋友要用的話，把 Vercel 的網址直接分享給他們就可以了，不需要額外設定帳號或付費。
