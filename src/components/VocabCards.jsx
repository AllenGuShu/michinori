import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shuffle, Volume2 } from "lucide-react";
import { WordRuby } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { getAllVocab } from "../lib/newsArchive.js";

const CATEGORY_ORDER = ["政治・社會", "經濟・商業", "天氣・災害", "社會・生活", "交通・觀光", "運動", "科技", "文化・娛樂", "健康・醫療", "其他"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabCards() {
  const [allVocab] = useState(() => getAllVocab());
  const [category, setCategory] = useState("全部");
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const categories = useMemo(() => {
    const present = new Set(allVocab.map((v) => v.category).filter(Boolean));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c));
    return ["全部", ...ordered, ...extra];
  }, [allVocab]);

  useEffect(() => {
    const filtered = category === "全部" ? allVocab : allVocab.filter((v) => v.category === category);
    setDeck(filtered);
    setIndex(0);
    setFlipped(false);
  }, [category, allVocab]);

  const card = deck[index];

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.length);
  };
  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.length) % deck.length);
  };
  const reshuffle = () => {
    setDeck((d) => shuffle(d));
    setIndex(0);
    setFlipped(false);
  };

  if (allVocab.length === 0) {
    return (
      <div className="empty-state">
        <p>還沒有累積到任何單字。<br />先去「新聞分析」上傳幾篇文章，這裡就會自動出現單字卡。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="n5-intro">📇 從你分析過的 {allVocab.length} 個單字彙整而成，點卡片翻面看意思。</div>

      <div className="theme-row">
        {categories.map((c) => (
          <button key={c} className={`theme-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {deck.length === 0 || !card ? (
        <div className="empty-state">
          <p>這個分類還沒有單字。</p>
        </div>
      ) : (
        <>
          <div className="deck-meta">{category} · {index + 1} / {deck.length}</div>

          <div className={`flip-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
            <div className="flip-card-inner">
              <div className="flip-face flip-front">
                {card.level && <span className="level-tag">{card.level}</span>}
                {card.category && <span className="category-tag">{card.category}</span>}
                <div className="jp-kanji"><WordRuby word={card.word} reading={card.reading} /></div>
                <div className="tap-hint">點卡片看意思</div>
              </div>
              <div className="flip-face flip-back">
                <div className="zh-meaning">{card.zh}</div>
                {card.sourceTitle && (
                  <div className="vocab-card-source-dark">出自：{card.sourceTitle}（{card.sourceDate}）</div>
                )}
              </div>
            </div>
          </div>

          <div className="card-controls">
            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                speak(card.reading || card.word);
              }}
              aria-label="播放發音"
            >
              <Volume2 size={20} />
            </button>
            <button className="btn btn-ghost" onClick={prev}>
              <ChevronLeft size={16} /> 上一個
            </button>
            <button className="btn btn-accent" onClick={next}>
              下一個 <ChevronRight size={16} />
            </button>
          </div>
          <button className="btn btn-ghost shuffle-btn" onClick={reshuffle}>
            <Shuffle size={16} /> 打亂順序
          </button>
        </>
      )}
    </div>
  );
}
