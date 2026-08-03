import React, { useState, useCallback, useEffect } from "react";
import { Volume2, Check, X, RotateCcw } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import RouteProgress from "./RouteProgress.jsx";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabTrainer({ deck, deckLabel, onSrsMiss, onSrsKnow, isSrsDeck = false, emptyMessage }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [missed, setMissed] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [shuffledDeck, setShuffledDeck] = useState(() => shuffle(deck));

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setKnown([]);
    setMissed([]);
    setReviewMode(false);
    setShuffledDeck(shuffle(deck));
  }, [deck]);

  const activeDeck = reviewMode ? shuffledDeck.filter((c) => missed.includes(c.id)) : shuffledDeck;
  const card = activeDeck[index];
  const finished = index >= activeDeck.length;

  const next = useCallback(() => {
    setFlipped(false);
    setIndex((i) => i + 1);
  }, []);

  const markKnown = () => {
    setKnown((k) => [...k, card.id]);
    if (onSrsKnow) onSrsKnow(card.id);
    next();
  };
  const markMissed = () => {
    setMissed((m) => (m.includes(card.id) ? m : [...m, card.id]));
    if (onSrsMiss) onSrsMiss(card.id);
    next();
  };

  const restart = (toReview) => {
    setIndex(0);
    setFlipped(false);
    setReviewMode(toReview);
    if (toReview) {
      setMissed([]);
    } else {
      setKnown([]);
      setMissed([]);
      setShuffledDeck(shuffle(deck));
    }
  };

  if (deck.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage || "這個主題目前沒有卡片。"}</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="result-card">
        <h3>{isSrsDeck ? "今日複習完成！" : reviewMode ? "複習完成！" : `${deckLabel}完成！`}</h3>
        <div className="result-stats">
          <div><span className="num">{known.length}</span><span className="lbl">學會</span></div>
          <div><span className="num">{missed.length}</span><span className="lbl">待複習</span></div>
        </div>
        <div className="result-actions">
          {missed.length > 0 && !reviewMode && (
            <button className="btn btn-accent" onClick={() => restart(true)}>
              <RotateCcw size={16} /> 複習不熟的 {missed.length} 個
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => restart(false)}>
            <RotateCcw size={16} /> 重新開始整組
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RouteProgress current={index} total={activeDeck.length} />
      <div className="deck-meta">
        {reviewMode ? "複習模式" : deckLabel} · {index + 1} / {activeDeck.length}
      </div>

      <div className={`flip-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
        <div className="flip-card-inner">
          <div className="flip-face flip-front">
            {card.level && <span className="level-tag">{card.level}</span>}
            <div className="jp-kanji">{card.kanji}</div>
            <div className="jp-kana">{card.kana}</div>
            <div className="tap-hint">點卡片看意思、例句與文法重點</div>
          </div>
          <div className="flip-face flip-back">
            <div className="zh-meaning">{card.zh}</div>
            <div className="romaji">{card.romaji}</div>
            {card.polite && <div className="polite-badge">敬語（ます／です形）：{card.polite}</div>}
            {card.ex && (
              <div className="example-box">
                <div className="example-jp"><Furigana text={card.ex} /></div>
                {card.exZh && <div className="example-zh">{card.exZh}</div>}
                {card.note && <div className="grammar-note">📌 {card.note}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-controls">
        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            speak(card.ex || card.kana || card.kanji);
          }}
          aria-label="播放發音"
        >
          <Volume2 size={20} />
        </button>
        <button className="btn btn-miss" onClick={markMissed}>
          <X size={16} /> 不熟
        </button>
        <button className="btn btn-know" onClick={markKnown}>
          <Check size={16} /> 學會了
        </button>
      </div>
    </div>
  );
}
