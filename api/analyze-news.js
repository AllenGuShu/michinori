// Vercel Serverless Function
// 前端把新聞截圖(base64)傳過來，這裡在伺服器端安全地呼叫 Claude API 做：
// 1. 圖片文字辨識(OCR) 2. 加假名標註 3. 單字/文法分析 4. 生活+旅遊延伸例句
// ANTHROPIC_API_KEY 存在 Vercel 的環境變數，不會曝露給瀏覽器。

const ANTHROPIC_MODEL = "claude-sonnet-4-6";

const PROMPT = `你是日文學習教材編輯。請看這張新聞截圖，完成以下任務，並「只回傳純JSON」，不要任何說明文字、不要markdown code block：

1. 精確辨識圖片中的日文內容（OCR），保留原本的段落分行，用陣列表示每一段。
2. 幫每個漢字加上假名標註，格式是「漢字[假名]」，例如「東京[とうきょう]」。只需要標漢字，平假名、片假名、標點符號、數字不需要標註。
3. 幫整篇文章寫一個精簡的中文標題（15字以內）。
4. 提供整篇文章的中文翻譯（可以分段對應）。
5. 挑選5到8個對日文學習者實用的重點單字。
6. 分析文章中出現的2到4個文法句型，並各自附上文章中的原句當例句。
7. 根據這篇文章出現的單字或句型，額外造3句「日常生活情境」的全新例句、3句「旅遊情境」的全新例句（不是文章裡的原句），一樣要加假名標註。

回傳格式（純JSON，不要其他文字，不要markdown code block）：
{
  "title": "中文標題",
  "extractedText": ["第一段原文（含假名標註）...", "第二段原文..."],
  "extractedTextZh": "整篇中文翻譯",
  "vocab": [{"word":"漢字或原文","reading":"假名讀音","zh":"中文意思"}],
  "grammar": [{"pattern":"句型","meaning":"中文語意","note":"用法說明","example":"文章中的例句(含假名標註)","exampleZh":"例句中文翻譯"}],
  "extendedLife": [{"jp":"日常生活例句(含假名標註)","zh":"中文翻譯"}],
  "extendedTravel": [{"jp":"旅遊情境例句(含假名標註)","zh":"中文翻譯"}]
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64) {
    res.status(400).json({ error: "缺少圖片資料" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "伺服器尚未設定 ANTHROPIC_API_KEY（請到 Vercel 專案設定加上這個環境變數）" });
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: imageBase64 } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: `Claude API 呼叫失敗：${errText.slice(0, 300)}` });
      return;
    }

    const data = await response.json();
    const text = data.content.map((b) => b.text || "").join("\n");
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      res.status(502).json({ error: "AI 回傳的內容無法解析，請再試一次（有時候是圖片不夠清楚）。" });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message || "分析時發生未知錯誤" });
  }
}
