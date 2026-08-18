import React, { useState, useRef } from "react";
import { Camera, Loader2, Trash2, ChevronDown, ChevronUp, Volume2, ExternalLink, Link2 } from "lucide-react";
import { Furigana, WordRuby } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { loadArchive, saveArticle, deleteArticle } from "../lib/newsArchive.js";

const QUICK_LINKS = [
  { label: "NHK Easy（簡易日文）", note: "適合先從這裡開始", url: "https://www3.nhk.or.jp/news/easy/" },
  { label: "主要", note: "當日焦點新聞", url: "https://news.yahoo.co.jp/topics/top-picks" },
  { label: "國內・社會", note: "政治、社會、生活議題", url: "https://news.yahoo.co.jp/topics/domestic" },
  { label: "國際", note: "國際新聞", url: "https://news.yahoo.co.jp/topics/world" },
  { label: "經濟・商業", note: "股市、企業、物價", url: "https://news.yahoo.co.jp/topics/business" },
  { label: "運動", note: "賽事、選手", url: "https://news.yahoo.co.jp/topics/sports" },
  { label: "科技", note: "IT、網路、手機", url: "https://news.yahoo.co.jp/topics/it" },
  { label: "科學", note: "科學新知", url: "https://news.yahoo.co.jp/topics/science" },
  { label: "娛樂・文化", note: "電影、音樂、藝人", url: "https://news.yahoo.co.jp/topics/entertainment" },
  { label: "地方・生活", note: "地方新聞、天氣、日常", url: "https://news.yahoo.co.jp/topics/local" },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NewsAnalyzer() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linksOpen, setLinksOpen] = useState(true);
  const [archive, setArchive] = useState(() => loadArchive());
  const [openId, setOpenId] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError("");
    setPreview(URL.createObjectURL(f));
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/analyze-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分析失敗");

      const article = { id: `news-${Date.now()}`, date: new Date().toISOString().slice(0, 10), ...data };
      const next = saveArticle(article);
      setArchive(next);
      setOpenId(article.id);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || "分析時發生錯誤，請再試一次。");
    } finally {
      setLoading(false);
    }
  };

  const removeArticle = (id) => setArchive(deleteArticle(id));
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div>
      <div className="n5-intro">📸 上傳你今天看的新聞截圖，自動幫你整理單字、文法、延伸例句，累積成專屬新聞資料庫。</div>

      <div className="n5-lesson-card quick-links-card">
        <button className="n5-lesson-header" onClick={() => setLinksOpen((o) => !o)}>
          <Link2 size={16} style={{ flexShrink: 0 }} />
          <span className="n5-lesson-title">🔗 今日快速連結（去挑一篇新聞）</span>
          {linksOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {linksOpen && (
          <div className="n5-lesson-body">
            <div className="quick-links-hint">
              點連結去分類頁面挑一篇喜歡的新聞，截圖後回來上傳分析。這些只是幫你導覽閱讀的連結，不會自動抓取內容。
            </div>
            <div className="quick-links-grid">
              {QUICK_LINKS.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="quick-link-item">
                  <span className="quick-link-label">{l.label}</span>
                  <span className="quick-link-note">{l.note}</span>
                  <ExternalLink size={13} className="quick-link-icon" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="news-upload-card">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button className="news-upload-btn" onClick={() => fileInputRef.current?.click()}>
          <Camera size={18} /> {file ? "重新選擇圖片" : "上傳／拍攝新聞截圖"}
        </button>

        {preview && (
          <div className="news-preview-wrap">
            <img src={preview} alt="預覽" className="news-preview-img" />
          </div>
        )}

        {file && (
          <button className="btn btn-accent news-analyze-btn" onClick={analyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" /> 分析中，請稍候...
              </>
            ) : (
              "開始分析"
            )}
          </button>
        )}

        {error && <div className="grammar-note news-error-note">{error}</div>}
      </div>

      <div className="n5-section-title" style={{ marginTop: 20 }}>已分析的新聞（{archive.length}）</div>
      <div className="n5-lesson-list">
        {archive.length === 0 && (
          <div className="empty-state">
            <p>還沒有分析過的新聞，上傳第一張截圖看看吧。</p>
          </div>
        )}
        {archive.map((a) => {
          const isOpen = openId === a.id;
          return (
            <div key={a.id} className="n5-lesson-card">
              <button className="n5-lesson-header" onClick={() => toggle(a.id)}>
                <span className="n5-lesson-badge">{a.date}</span>
                <span className="n5-lesson-title">{a.title}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="n5-lesson-body">
                  <div className="n5-section-title">原文</div>
                  <div className="n5-sentence-list">
                    {(a.extractedText || []).map((p, i) => (
                      <div key={i} className="n5-sentence-item">
                        <div className="n5-sentence-row">
                          <div className="n5-sentence-jp"><Furigana text={p} /></div>
                          <button className="n5-speak-btn" onClick={() => speak(p)} aria-label="播放發音">
                            <Volume2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="news-zh-block">{a.extractedTextZh}</div>

                  <div className="n5-section-title">重點單字</div>
                  <div className="vocab-chip-row">
                    {(a.vocab || []).map((v, i) => (
                      <span key={i} className="vocab-chip">
                        <WordRuby word={v.word} reading={v.reading} />
                        <span className="vocab-chip-zh">{v.zh}</span>
                      </span>
                    ))}
                  </div>

                  <div className="n5-section-title">文法重點</div>
                  <div className="grammar-list">
                    {(a.grammar || []).map((g, i) => (
                      <div key={i} className="grammar-list-item">
                        <span className="pattern-chip">{g.pattern}</span>
                        <span className="grammar-list-note">{g.meaning}｜{g.note}</span>
                        <div className="n5-sentence-jp" style={{ marginTop: 6 }}><Furigana text={g.example} /></div>
                        <div className="n5-sentence-zh">{g.exampleZh}</div>
                      </div>
                    ))}
                  </div>

                  <div className="n5-section-title">延伸例句・生活</div>
                  <div className="n5-sentence-list">
                    {(a.extendedLife || []).map((s, i) => (
                      <div key={i} className="n5-sentence-item">
                        <div className="n5-sentence-jp"><Furigana text={s.jp} /></div>
                        <div className="n5-sentence-zh">{s.zh}</div>
                      </div>
                    ))}
                  </div>

                  <div className="n5-section-title">延伸例句・旅遊</div>
                  <div className="n5-sentence-list">
                    {(a.extendedTravel || []).map((s, i) => (
                      <div key={i} className="n5-sentence-item">
                        <div className="n5-sentence-jp"><Furigana text={s.jp} /></div>
                        <div className="n5-sentence-zh">{s.zh}</div>
                      </div>
                    ))}
                  </div>

                  <button className="news-delete-btn" onClick={() => removeArticle(a.id)}>
                    <Trash2 size={14} /> 刪除這篇
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
