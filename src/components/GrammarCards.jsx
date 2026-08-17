import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle, Volume2 } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { getAllGrammar } from "../lib/newsArchive.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GrammarCards() {
  const [deck, setDeck] = useState(() => getAllGrammar());
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

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

  if (deck.length === 0) {
    return (
      <div className="empty-state">
        <p>還沒有累積到任何文法。<br />先去「新聞分析」上傳幾篇文章，這裡就會自動出現文法卡。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="n5-intro">📖 從你分析過的 {deck.length} 個文法句型彙整而成，點卡片翻面看說明與例句。</div>

      <div className="deck-meta">{index + 1} / {deck.length}</div>

      <div className={`flip-card grammar-flip-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
        <div className="flip-card-inner">
          <div className="flip-face flip-front">
            {card.level && <span className="level-tag">{card.level}</span>}
            <div className="grammar-card-pattern">{card.pattern}</div>
            <div className="tap-hint">點卡片看說明與例句</div>
          </div>
          <div className="flip-face flip-back">
            <div className="zh-meaning" style={{ fontSize: 18 }}>{card.meaning}</div>
            {card.note && <div className="grammar-note-dark">📌 {card.note}</div>}
            {card.example && (
              <div className="example-box">
                <div className="example-jp"><Furigana text={card.example} /></div>
                {card.exampleZh && <div className="example-zh">{card.exampleZh}</div>}
              </div>
            )}
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
            speak(card.example || card.pattern);
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
    </div>
  );
}
