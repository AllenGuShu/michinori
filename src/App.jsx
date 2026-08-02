import React, { useState, useMemo, useCallback, useEffect } from "react";
import { BookOpen, PenLine, RotateCcw } from "lucide-react";
import { CORE_VOCAB, TRAVEL_VOCAB, THEMES, ALL_VOCAB } from "./data/vocab.js";
import GrammarReference from "./components/GrammarReference.jsx";
import VocabTrainer from "./components/VocabTrainer.jsx";
import DialogueTrainer from "./components/DialogueTrainer.jsx";
import NewsSection from "./components/NewsSection.jsx";
import ListeningTrainer from "./components/ListeningTrainer.jsx";
import SpeakingTrainer from "./components/SpeakingTrainer.jsx";
import { loadQueue, saveQueue, scheduleMiss, clearCard, getDueDeck } from "./lib/srs.js";
import { markLearned, unmarkLearned } from "./lib/learned.js";
import { recordActivity, getStreak } from "./lib/streak.js";
import LearnedSection from "./components/LearnedSection.jsx";

export default function App() {
  const [mode, setMode] = useState("vocab");
  const [cat, setCat] = useState("core");
  const [theme, setTheme] = useState("全部");
  const [reviewQueue, setReviewQueue] = useState(() => loadQueue());
  const [streak, setStreak] = useState(() => getStreak());

  useEffect(() => {
    setStreak(recordActivity());
  }, []);

  const handleSrsMiss = useCallback((cardId) => {
    setReviewQueue((prev) => {
      const next = scheduleMiss(prev, cardId);
      saveQueue(next);
      return next;
    });
    unmarkLearned("vocab", cardId);
  }, []);

  const handleSrsKnow = useCallback((cardId) => {
    setReviewQueue((prev) => {
      const next = clearCard(prev, cardId);
      saveQueue(next);
      return next;
    });
    markLearned("vocab", cardId);
  }, []);

  const dueDeck = useMemo(() => getDueDeck(ALL_VOCAB, reviewQueue), [reviewQueue]);

  const catLabel = cat === "core" ? "生活日文基礎" : "旅遊日文";
  const themeOptions = THEMES[cat];

  const handleCatChange = (c) => {
    setCat(c);
    setTheme("全部");
  };

  const sourceVocab = cat === "core" ? CORE_VOCAB : TRAVEL_VOCAB;
  const vocabDeck = useMemo(() => {
    return sourceVocab.filter((v) => theme === "全部" || v.theme === theme);
  }, [sourceVocab, theme]);

  const deckLabel = theme === "全部" ? catLabel : `${catLabel}・${theme}`;

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Noto+Serif+JP:wght@500;600;700&display=swap');

        * { box-sizing: border-box; }
        .app-root {
          --ink: #21262b;
          --ai: #24446e;
          --ai-deep: #16304f;
          --kaki: #e2703a;
          --wakakusa: #7a9b57;
          --paper: #f6f3ea;
          --paper-card: #fffdf7;
          --line: #d8d1bf;
          font-family: 'Zen Kaku Gothic New', 'Noto Sans TC', sans-serif;
          background: var(--paper);
          background-image: radial-gradient(circle at 1px 1px, rgba(36,68,110,0.06) 1px, transparent 0);
          background-size: 18px 18px;
          color: var(--ink);
          min-height: 100vh;
          padding: calc(20px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right)) calc(40px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));
          display: flex;
          justify-content: center;
        }
        .shell { width: 100%; max-width: 440px; }

        .header { margin-bottom: 18px; }
        .header-top-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .streak-badge {
          font-size: 11.5px; font-weight: 700; color: var(--kaki); background: rgba(226,112,58,0.1);
          border: 1px solid rgba(226,112,58,0.3); border-radius: 999px; padding: 3px 10px; white-space: nowrap;
        }
        .eyebrow { font-size: 12px; letter-spacing: 0.14em; color: var(--kaki); font-weight: 700; text-transform: uppercase; }
        .title { font-family: 'Noto Serif JP', serif; font-size: 28px; font-weight: 700; color: var(--ai-deep); margin: 2px 0 2px; }
        .subtitle { font-size: 13px; color: #6b6355; }

        .tabs { display: flex; gap: 8px; margin: 18px 0 10px; }
        .tab-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 8px; border-radius: 10px; border: 1.5px solid var(--line);
          background: var(--paper-card); color: var(--ink); font-weight: 600; font-size: 14px;
          cursor: pointer; transition: all .15s ease;
        }
        .tab-btn.active { background: var(--ai); border-color: var(--ai); color: #fff; }

        .cat-switch { display: flex; gap: 8px; margin-bottom: 10px; }
        .cat-btn {
          flex: 1; padding: 8px; border-radius: 999px; border: 1.5px solid var(--line);
          background: transparent; font-size: 13px; font-weight: 600; color: #6b6355;
          cursor: pointer; transition: all .15s ease;
        }
        .cat-btn.active { background: var(--kaki); border-color: var(--kaki); color: #fff; }

        .theme-row {
          display: flex; gap: 6px; margin-bottom: 18px; overflow-x: auto;
          padding-bottom: 2px; -ms-overflow-style: none; scrollbar-width: none;
        }
        .theme-row::-webkit-scrollbar { display: none; }
        .theme-chip {
          flex: 0 0 auto; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line);
          background: var(--paper-card); font-size: 12.5px; font-weight: 600; color: #6b6355; cursor: pointer; white-space: nowrap;
        }
        .theme-chip.active { background: var(--ai); border-color: var(--ai); color: #fff; }

        .route-track { position: relative; height: 24px; margin: 4px 0 6px; }
        .route-line {
          position: absolute; top: 11px; left: 0; right: 0; height: 2px;
          background-image: linear-gradient(to right, var(--line) 60%, transparent 0);
          background-size: 10px 2px; background-repeat: repeat-x;
        }
        .route-fill { position: absolute; top: 11px; left: 0; height: 2px; background: var(--ai); transition: width .3s ease; }
        .route-dot {
          position: absolute; top: 5px; width: 14px; height: 14px; border-radius: 50%;
          background: var(--kaki); border: 2px solid var(--paper-card); transition: left .3s ease;
        }
        .route-flag { position: absolute; right: -2px; top: -3px; font-size: 14px; }

        .deck-meta { font-size: 12px; color: #8a8172; margin-bottom: 10px; font-weight: 600; }
        .pattern-chip { background: rgba(36,68,110,0.08); color: var(--ai-deep); padding: 1px 8px; border-radius: 999px; font-weight: 700; }

        .flip-card { perspective: 1200px; height: 340px; cursor: pointer; margin-bottom: 16px; }
        .flip-card-inner {
          position: relative; width: 100%; height: 100%; text-align: center;
          transition: transform .5s cubic-bezier(.2,.7,.3,1); transform-style: preserve-3d;
        }
        .flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }
        .flip-face {
          position: absolute; inset: 0; backface-visibility: hidden;
          border-radius: 16px; border: 1.5px solid var(--line); background: var(--paper-card);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 20px; box-shadow: 0 2px 0 var(--line); overflow-y: auto;
        }
        .flip-front::before, .flip-front::after {
          content: ""; position: absolute; width: 14px; height: 14px; background: var(--paper);
          border-radius: 50%; top: 50%; transform: translateY(-50%);
        }
        .flip-front::before { left: -8px; }
        .flip-front::after { right: -8px; }
        .flip-back { transform: rotateY(180deg); background: var(--ai-deep); border-color: var(--ai-deep); padding: 22px; }
        .level-tag {
          position: absolute; top: 12px; left: 14px; font-size: 11px; font-weight: 700;
          color: var(--kaki); border: 1px solid var(--kaki); border-radius: 4px; padding: 1px 6px;
        }
        .jp-kanji { font-family: 'Noto Serif JP', serif; font-size: 34px; font-weight: 700; color: var(--ai-deep); }
        .jp-kana { font-size: 15px; color: #8a8172; margin-top: 6px; }
        .tap-hint { position: absolute; bottom: 12px; font-size: 11px; color: #a89f8f; }
        .zh-meaning { font-size: 21px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .romaji { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px; font-style: italic; flex-shrink: 0; }
        .polite-badge {
          margin-top: 10px; font-size: 11.5px; color: #ffe1cc; background: rgba(226,112,58,0.25);
          border: 1px solid rgba(226,112,58,0.5); border-radius: 8px; padding: 4px 10px; flex-shrink: 0;
        }
        .example-box { margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.25); width: 100%; }
        .example-jp { font-size: 15px; color: #fff; line-height: 2.1; }
        .example-jp ruby rt { font-size: 10px; color: rgba(255,255,255,0.75); }
        .example-zh { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 6px; }
        .grammar-note {
          margin-top: 10px; font-size: 11.5px; color: #e8f0e0; background: rgba(122,155,87,0.22);
          border-radius: 8px; padding: 8px 10px; line-height: 1.5; text-align: left;
        }

        .card-controls { display: flex; align-items: center; gap: 10px; }
        .icon-btn {
          width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--line);
          background: var(--paper-card); display: flex; align-items: center; justify-content: center;
          color: var(--ai); cursor: pointer; flex-shrink: 0;
        }
        .btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 12px; border-radius: 12px; border: none; font-weight: 700; font-size: 14px; cursor: pointer;
        }
        .btn-miss { background: #f1e4dd; color: #b0472a; }
        .btn-know { background: var(--wakakusa); color: #fff; }
        .btn-accent { background: var(--kaki); color: #fff; }
        .btn-ghost { background: transparent; border: 1.5px solid var(--line); color: var(--ink); }

        .grammar-card {
          position: relative; background: var(--paper-card); border: 1.5px solid var(--line);
          border-radius: 16px; padding: 22px 18px 18px; box-shadow: 0 2px 0 var(--line);
        }
        .grammar-ref-card {
          position: relative; background: var(--ai-deep); border-radius: 16px;
          padding: 26px 20px 20px; margin-bottom: 16px; color: #fff;
        }
        .grammar-ref-pattern {
          font-family: 'Noto Serif JP', serif; font-size: 26px; font-weight: 700; margin-top: 10px;
        }
        .grammar-ref-meaning { font-size: 15px; color: rgba(255,255,255,0.75); margin-top: 6px; }
        .example-box-light {
          margin-top: 18px; padding: 14px; background: rgba(255,255,255,0.08); border-radius: 12px;
          border-top: none;
        }
        .example-jp-dark { font-size: 15.5px; line-height: 2.1; color: #fff; }
        .example-jp-dark ruby rt { font-size: 10px; color: rgba(255,255,255,0.75); }
        .example-zh-dark { font-size: 12.5px; color: rgba(255,255,255,0.65); margin-top: 6px; }
        .grammar-note-light {
          margin-top: 14px; font-size: 12.5px; color: #e8f0e0; background: rgba(122,155,87,0.28);
          border-radius: 8px; padding: 10px 12px; line-height: 1.6; text-align: left;
        }
        .learned-tag {
          position: absolute; top: 12px; right: 14px; font-size: 11px; font-weight: 700;
          color: #d8ecc8; background: rgba(122,155,87,0.35); border-radius: 999px; padding: 2px 10px;
        }
        .learn-toggle-btn { width: 100%; margin-top: 10px; }
        .btn-learned-active { background: var(--wakakusa); color: #fff; }

        .learned-summary { display: flex; gap: 12px; margin-bottom: 16px; }
        .learned-summary-item {
          flex: 1; background: var(--paper-card); border: 1.5px solid var(--line); border-radius: 12px;
          padding: 14px; text-align: center;
        }
        .learned-summary-num { display: block; font-size: 26px; font-weight: 700; color: var(--ai); }
        .learned-summary-lbl { font-size: 11.5px; color: #8a8172; }
        .learned-list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
        .learned-row {
          position: relative; background: var(--paper-card); border: 1.5px solid var(--line);
          border-radius: 12px; padding: 12px 40px 12px 14px; cursor: pointer;
        }
        .learned-row-main { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
        .learned-row-kanji { font-family: 'Noto Serif JP', serif; font-weight: 700; font-size: 16px; color: var(--ai-deep); }
        .learned-row-pattern { font-size: 15px; }
        .learned-row-kana { font-size: 12px; color: #a89f8f; }
        .learned-row-zh { font-size: 13px; color: #6b6355; }
        .learned-remove-btn {
          position: absolute; top: 10px; right: 10px; background: none; border: none; color: #b0472a;
          cursor: pointer; padding: 4px;
        }
        .learned-row-detail {
          margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--line);
          font-size: 13.5px; line-height: 1.8; color: var(--ink);
        }
        .learned-row-detail-zh { font-size: 12px; color: #8a8172; margin-top: 2px; }

        .listening-card {
          background: var(--paper-card); border: 1.5px solid var(--line); border-radius: 16px;
          padding: 32px 20px; text-align: center; margin-bottom: 16px;
        }
        .listen-play-btn {
          width: 72px; height: 72px; border-radius: 50%; border: none; background: var(--ai);
          color: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .listening-hint { margin-top: 14px; font-size: 13px; color: #8a8172; }
        .listening-transcript {
          margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--line);
          font-size: 16px; line-height: 2; color: var(--ai-deep);
        }
        .listening-transcript ruby rt { font-size: 10px; color: #a89f8f; }

        .speaking-result {
          margin-top: 14px; background: var(--paper-card); border: 1.5px solid var(--line);
          border-radius: 14px; padding: 16px;
        }
        .speaking-result-row { font-size: 15px; margin-bottom: 10px; }
        .speaking-result-label { font-weight: 700; color: var(--ai-deep); margin-right: 6px; }
        .speaking-score-bar { height: 8px; border-radius: 999px; background: var(--line); overflow: hidden; }
        .speaking-score-fill { height: 100%; background: var(--wakakusa); transition: width .3s ease; }
        .speaking-score-label { font-size: 12.5px; color: #6b6355; margin-top: 6px; }
        .sentence { font-family: 'Noto Serif JP', serif; font-size: 19px; line-height: 1.7; color: var(--ai-deep); margin: 14px 0 18px; }
        .options { display: flex; flex-direction: column; gap: 8px; }
        .option-btn {
          text-align: left; padding: 12px 14px; border-radius: 10px; border: 1.5px solid var(--line);
          background: var(--paper); font-size: 15px; cursor: pointer; color: var(--ink);
        }
        .option-btn:disabled { cursor: default; }
        .option-correct { border-color: var(--wakakusa); background: rgba(122,155,87,0.16); font-weight: 700; }
        .option-wrong { border-color: var(--kaki); background: rgba(226,112,58,0.12); }

        .explain { margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--line); }
        .explain-zh { font-weight: 700; margin-bottom: 4px; }
        .explain-note { font-size: 13px; color: #6b6355; margin-bottom: 14px; }
        .next-btn { width: 100%; }

        .result-card { text-align: center; background: var(--paper-card); border: 1.5px solid var(--line); border-radius: 16px; padding: 28px 20px; }
        .result-card h3 { font-family: 'Noto Serif JP', serif; color: var(--ai-deep); margin-bottom: 16px; }
        .result-stats { display: flex; justify-content: center; gap: 32px; margin-bottom: 20px; }
        .result-stats .num { display: block; font-size: 28px; font-weight: 700; color: var(--ai); }
        .result-stats .lbl { font-size: 12px; color: #8a8172; }
        .result-actions { display: flex; flex-direction: column; gap: 10px; }

        .empty-state { text-align: center; padding: 40px 0; color: #8a8172; }

        .tabs-scroll { overflow-x: auto; flex-wrap: nowrap; -ms-overflow-style: none; scrollbar-width: none; }
        .tabs-scroll::-webkit-scrollbar { display: none; }
        .tabs-scroll .tab-btn { flex: 0 0 auto; padding: 10px 14px; position: relative; }
        .due-badge {
          background: var(--kaki); color: #fff; font-size: 10px; font-weight: 700;
          border-radius: 999px; padding: 1px 6px; margin-left: 2px;
        }

        .back-link { background: none; border: none; color: var(--ai); font-weight: 700; font-size: 13px; cursor: pointer; padding: 0 0 12px; }

        .scenario-list { display: flex; flex-direction: column; gap: 10px; }
        .scenario-card {
          display: flex; align-items: center; gap: 12px; text-align: left;
          background: var(--paper-card); border: 1.5px solid var(--line); border-radius: 14px;
          padding: 14px; cursor: pointer; color: var(--ink);
        }
        .scenario-icon { font-size: 24px; }
        .scenario-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .scenario-title { font-weight: 700; font-size: 15px; }
        .scenario-theme { font-size: 12px; color: #8a8172; }

        .scenario-header { display: flex; flex-direction: column; margin-bottom: 8px; }
        .scenario-header-title { font-weight: 700; color: var(--ai-deep); font-size: 15px; margin-bottom: 4px; }

        .dialogue-scroll { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; max-height: 320px; overflow-y: auto; }
        .bubble-row { display: flex; }
        .row-user { justify-content: flex-end; }
        .row-other { justify-content: flex-start; }
        .bubble { max-width: 82%; border-radius: 14px; padding: 10px 13px; }
        .bubble-other { background: var(--paper-card); border: 1.5px solid var(--line); border-bottom-left-radius: 4px; }
        .bubble-user { background: var(--ai); color: #fff; border-bottom-right-radius: 4px; }
        .bubble-jp { font-size: 14.5px; line-height: 1.9; }
        .bubble-jp ruby rt { font-size: 9px; }
        .bubble-user .bubble-jp ruby rt { color: rgba(255,255,255,0.75); }
        .bubble-zh { font-size: 11.5px; opacity: 0.65; margin-top: 4px; }
        .dialogue-current { margin-top: 4px; }
        .bubble-current { max-width: 100%; margin-bottom: 12px; }
        .prompt-text { font-size: 13px; color: #8a8172; font-weight: 600; margin-bottom: 10px; }

        .news-banner {
          font-size: 12px; color: var(--ai-deep); background: rgba(36,68,110,0.08);
          border: 1px solid rgba(36,68,110,0.18); border-radius: 10px; padding: 10px 12px; margin-bottom: 14px; line-height: 1.6;
        }
        .news-card {
          display: block; text-align: left; width: 100%; background: var(--paper-card);
          border: 1.5px solid var(--line); border-radius: 14px; padding: 14px; cursor: pointer; color: var(--ink);
        }
        .news-date { font-size: 11px; color: #a89f8f; font-weight: 600; margin-bottom: 4px; }
        .news-title { font-family: 'Noto Serif JP', serif; font-size: 16px; color: var(--ai-deep); line-height: 1.7; }
        .news-title-zh { font-size: 12px; color: #8a8172; margin-top: 4px; }
        .news-detail { background: var(--paper-card); border: 1.5px solid var(--line); border-radius: 16px; padding: 18px; }
        .news-detail-title { font-family: 'Noto Serif JP', serif; font-size: 19px; color: var(--ai-deep); line-height: 1.8; margin: 6px 0 2px; }
        .news-detail-title-zh { font-size: 13px; color: #8a8172; margin-bottom: 14px; }
        .news-body-line { font-size: 15px; line-height: 2.1; margin-bottom: 6px; }
        .news-body-line ruby rt { font-size: 9.5px; color: #8a8172; }
        .news-body-zh { font-size: 12.5px; color: #8a8172; margin: 10px 0 18px; padding-top: 10px; border-top: 1px dashed var(--line); line-height: 1.7; }
        .news-section-title { font-weight: 700; font-size: 13px; color: var(--ai-deep); margin: 14px 0 8px; }
        .vocab-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .vocab-chip {
          display: flex; align-items: baseline; gap: 6px; background: rgba(226,112,58,0.1);
          border: 1px solid rgba(226,112,58,0.3); border-radius: 999px; padding: 5px 11px; font-size: 13px;
        }
        .vocab-chip ruby rt { font-size: 9px; }
        .vocab-chip-zh { font-size: 11px; color: #6b6355; }
        .grammar-list { display: flex; flex-direction: column; gap: 8px; }
        .grammar-list-item { display: flex; flex-direction: column; gap: 4px; background: rgba(122,155,87,0.1); border-radius: 10px; padding: 8px 10px; }
        .grammar-list-note { font-size: 12.5px; color: #57614a; line-height: 1.5; }

        @media (prefers-reduced-motion: reduce) {
          .flip-card-inner, .route-fill, .route-dot { transition: none !important; }
        }
      `}</style>

      <div className="shell">
        <div className="header">
          <div className="header-top-row">
            <div className="eyebrow">通勤時間 · 學好用的日文</div>
            {streak.count > 0 && <div className="streak-badge">🔥 連續 {streak.count} 天</div>}
          </div>
          <div className="title">みちのり</div>
          <div className="subtitle">短短幾分鐘，把通勤路變成累積旅遊日文的路</div>
        </div>

        <div className="tabs tabs-scroll">
          <button className={`tab-btn ${mode === "vocab" ? "active" : ""}`} onClick={() => setMode("vocab")}>
            <BookOpen size={16} /> 單字
          </button>
          <button className={`tab-btn ${mode === "review" ? "active" : ""}`} onClick={() => setMode("review")}>
            <RotateCcw size={16} /> 今日複習
            {dueDeck.length > 0 && <span className="due-badge">{dueDeck.length}</span>}
          </button>
          <button className={`tab-btn ${mode === "grammar" ? "active" : ""}`} onClick={() => setMode("grammar")}>
            <PenLine size={16} /> 文法
          </button>
          <button className={`tab-btn ${mode === "dialogue" ? "active" : ""}`} onClick={() => setMode("dialogue")}>
            💬 會話
          </button>
          <button className={`tab-btn ${mode === "listening" ? "active" : ""}`} onClick={() => setMode("listening")}>
            🎧 聽力
          </button>
          <button className={`tab-btn ${mode === "speaking" ? "active" : ""}`} onClick={() => setMode("speaking")}>
            🎤 口說
          </button>
          <button className={`tab-btn ${mode === "news" ? "active" : ""}`} onClick={() => setMode("news")}>
            📰 新聞
          </button>
          <button className={`tab-btn ${mode === "learned" ? "active" : ""}`} onClick={() => setMode("learned")}>
            ✅ 已學習
          </button>
        </div>

        {mode === "vocab" && (
          <div className="cat-switch">
            <button className={`cat-btn ${cat === "core" ? "active" : ""}`} onClick={() => handleCatChange("core")}>生活日文基礎</button>
            <button className={`cat-btn ${cat === "travel" ? "active" : ""}`} onClick={() => handleCatChange("travel")}>旅遊日文</button>
          </div>
        )}

        {mode === "vocab" && (
          <div className="theme-row">
            {themeOptions.map((t) => (
              <button key={t} className={`theme-chip ${theme === t ? "active" : ""}`} onClick={() => setTheme(t)}>
                {t}
              </button>
            ))}
          </div>
        )}

        {mode === "vocab" && (
          <VocabTrainer
            key={`vocab-${cat}-${theme}`}
            deck={vocabDeck}
            deckLabel={deckLabel}
            onSrsMiss={handleSrsMiss}
            onSrsKnow={handleSrsKnow}
          />
        )}

        {mode === "review" && (
          <VocabTrainer
            key={`review-${dueDeck.length}`}
            deck={dueDeck}
            deckLabel="今日複習"
            isSrsDeck
            onSrsMiss={handleSrsMiss}
            onSrsKnow={handleSrsKnow}
            emptyMessage="今天沒有需要複習的字，太棒了！去練練新單字吧。"
          />
        )}

        {mode === "grammar" && <GrammarReference />}

        {mode === "dialogue" && <DialogueTrainer />}

        {mode === "listening" && <ListeningTrainer key={mode} />}

        {mode === "speaking" && <SpeakingTrainer key={mode} />}

        {mode === "news" && <NewsSection />}

        {mode === "learned" && <LearnedSection key={mode} />}
      </div>
    </div>
  );
}
