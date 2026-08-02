import React, { useState } from "react";
import { Furigana } from "../lib/furigana.jsx";
import NEWS_ARTICLES from "../news/articles.json";

export default function NewsSection() {
  const [openId, setOpenId] = useState(null);
  const article = NEWS_ARTICLES.find((a) => a.id === openId);

  if (!article) {
    return (
      <div>
        <div className="news-banner">
          📰 這裡的新聞是老師精選、再請 Claude 分析單字文法的內容，會不定期更新。
        </div>
        <div className="scenario-list">
          {NEWS_ARTICLES.map((a) => (
            <button key={a.id} className="news-card" onClick={() => setOpenId(a.id)}>
              <div className="news-date">{a.date}</div>
              <div className="news-title"><Furigana text={a.title} /></div>
              <div className="news-title-zh">{a.titleZh}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-link" onClick={() => setOpenId(null)}>← 新聞列表</button>
      <div className="news-detail">
        <div className="news-date">{article.date}</div>
        <h3 className="news-detail-title"><Furigana text={article.title} /></h3>
        <p className="news-detail-title-zh">{article.titleZh}</p>

        <div className="news-body">
          {article.body.map((line, i) => (
            <p key={i} className="news-body-line"><Furigana text={line} /></p>
          ))}
        </div>
        <p className="news-body-zh">{article.bodyZh}</p>

        <div className="news-section-title">🔤 重點單字</div>
        <div className="vocab-chip-row">
          {article.vocab.map((v, i) => (
            <span key={i} className="vocab-chip">
              <ruby>{v.word}<rt>{v.reading}</rt></ruby>
              <span className="vocab-chip-zh">{v.zh}</span>
            </span>
          ))}
        </div>

        <div className="news-section-title">📌 文法重點</div>
        <div className="grammar-list">
          {article.grammar.map((g, i) => (
            <div key={i} className="grammar-list-item">
              <span className="pattern-chip">{g.pattern}</span>
              <span className="grammar-list-note">{g.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
