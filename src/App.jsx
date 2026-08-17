import React, { useState, useEffect } from "react";
import { Moon, Sun, Camera, BookOpen, PenLine } from "lucide-react";
import NewsAnalyzer from "./components/NewsAnalyzer.jsx";
import VocabCards from "./components/VocabCards.jsx";
import GrammarCards from "./components/GrammarCards.jsx";
import { recordActivity, getStreak } from "./lib/streak.js";
import { loadTheme, saveTheme } from "./lib/theme.js";

export default function App() {
  const [mode, setMode] = useState("news");
  const [streak, setStreak] = useState(() => getStreak());
  const [darkMode, setDarkMode] = useState(() => loadTheme() === "dark");

  useEffect(() => {
    saveTheme(darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    setStreak(recordActivity());
  }, []);

  return (
    <div className={`app-root ${darkMode ? "dark" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Noto+Serif+JP:wght@500;600;700&display=swap');

        * { box-sizing: border-box; }
        .app-root {
          --ink: #21262b;
          --ai: #24446e;
          --ai-deep: #16304f;
          --heading: #16304f;
          --kaki: #e2703a;
          --wakakusa: #7a9b57;
          --shu: #c1272d;
          --paper: #f6f3ea;
          --paper-card: #fffdf7;
          --line: #d8d1bf;
          --muted-1: #6b6355;
          --muted-2: #8a8172;
          --muted-3: #a89f8f;
          --note-text: #3d4a2f;
          transition: background-color .2s ease, color .2s ease;
          font-family: 'Zen Kaku Gothic New', 'Noto Sans TC', sans-serif;
          background: var(--paper);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'%3E%3Cg fill='none' stroke='%2324446e' stroke-opacity='0.09' stroke-width='1'%3E%3Cpath d='M0 30a30 30 0 0 1 60 0'/%3E%3Cpath d='M0 30a20 20 0 0 1 40 0'/%3E%3Cpath d='M0 30a10 10 0 0 1 20 0'/%3E%3Cpath d='M-30 30a30 30 0 0 1 60 0'/%3E%3Cpath d='M30 30a30 30 0 0 1 60 0'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 60px 30px;
          color: var(--ink);
          min-height: 100vh;
          padding: calc(20px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right)) calc(40px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));
          display: flex;
          justify-content: center;
        }
        .shell { width: 100%; max-width: 480px; }

        .app-root.dark {
          --ink: #e5e1d5;
          --ai: #7ea2d6;
          --ai-deep: #14213a;
          --heading: #9dc0ee;
          --kaki: #f0925f;
          --wakakusa: #9bc178;
          --shu: #ef6a66;
          --paper: #191b20;
          --paper-card: #24262d;
          --line: #3a3d45;
          --muted-1: #b7b0a1;
          --muted-2: #948c7c;
          --muted-3: #746e60;
          --note-text: #cfe0bb;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'%3E%3Cg fill='none' stroke='%237ea2d6' stroke-opacity='0.12' stroke-width='1'%3E%3Cpath d='M0 30a30 30 0 0 1 60 0'/%3E%3Cpath d='M0 30a20 20 0 0 1 40 0'/%3E%3Cpath d='M0 30a10 10 0 0 1 20 0'/%3E%3Cpath d='M-30 30a30 30 0 0 1 60 0'/%3E%3Cpath d='M30 30a30 30 0 0 1 60 0'/%3E%3C/g%3E%3C/svg%3E");
        }

        .header { margin-bottom: 20px; }
        .header-top-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .header-top-right { display: flex; align-items: center; gap: 8px; }
        .eyebrow { font-size: 12px; letter-spacing: 0.14em; color: var(--kaki); font-weight: 700; text-transform: uppercase; }
        .streak-badge {
          font-size: 11.5px; font-weight: 700; color: var(--kaki); background: rgba(226,112,58,0.1);
          border: 1px solid rgba(226,112,58,0.3); border-radius: 999px; padding: 3px 10px; white-space: nowrap;
        }
        .dark-toggle-btn {
          width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line);
          background: var(--paper-card); color: var(--ink); display: flex; align-items: center;
          justify-content: center; cursor: pointer; flex-shrink: 0;
        }
        .title-row { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
        .title { font-family: 'Noto Serif JP', serif; font-size: 28px; font-weight: 700; color: var(--heading); margin: 2px 0 2px; }
        .hanko-stamp {
          width: 32px; height: 32px; flex-shrink: 0; position: relative;
          border: 1.5px solid var(--shu); border-radius: 5px; color: var(--shu);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Noto Serif JP', serif; font-weight: 700; font-size: 16px;
          transform: rotate(-7deg); opacity: 0.88;
        }
        .hanko-stamp::after { content: ""; position: absolute; inset: 3px; border: 1px solid var(--shu); border-radius: 3px; }
        .subtitle { font-size: 13px; color: var(--muted-1); margin-top: 4px; }

        .n5-intro {
          font-size: 12px; color: var(--heading); background: rgba(36,68,110,0.08);
          border: 1px solid rgba(36,68,110,0.18); border-radius: 10px; padding: 10px 12px; margin-bottom: 14px; line-height: 1.6;
        }

        .news-upload-card {
          background: var(--paper-card); border: 1.5px dashed var(--line); border-radius: 16px;
          padding: 20px; text-align: center; margin-bottom: 16px;
        }
        .news-upload-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px;
          border: 1.5px solid var(--ai); background: var(--paper); color: var(--ai); font-weight: 700;
          font-size: 14px; cursor: pointer;
        }
        .news-preview-wrap { margin-top: 14px; }
        .news-preview-img { max-width: 100%; max-height: 320px; border-radius: 12px; border: 1px solid var(--line); }
        .btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 12px; border-radius: 12px; border: none; font-weight: 700; font-size: 14px; cursor: pointer;
        }
        .btn-accent { background: var(--kaki); color: #fff; }
        .btn:disabled { opacity: 0.6; cursor: default; }
        .news-analyze-btn { width: 100%; margin-top: 14px; }
        .news-error-note { margin-top: 12px; color: #b0472a; text-align: left; }
        .news-zh-block { font-size: 12.5px; color: var(--muted-2); margin: 10px 0 4px; line-height: 1.7; }
        .news-delete-btn {
          display: inline-flex; align-items: center; gap: 4px; margin-top: 14px; font-size: 12px;
          color: var(--shu); background: none; border: 1px solid var(--shu); border-radius: 999px;
          padding: 5px 12px; cursor: pointer;
        }
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .n5-section-title { font-weight: 700; font-size: 13px; color: var(--heading); margin: 16px 0 8px; }
        .n5-lesson-list { display: flex; flex-direction: column; gap: 10px; }
        .n5-lesson-card { background: var(--paper-card); border: 1.5px solid var(--line); border-radius: 14px; overflow: hidden; }
        .n5-lesson-header {
          width: 100%; display: flex; align-items: center; gap: 10px; padding: 14px; background: none; border: none;
          cursor: pointer; text-align: left; color: var(--ink);
        }
        .n5-lesson-badge {
          font-size: 11px; font-weight: 700; color: #fff; background: var(--ai); border-radius: 999px;
          padding: 3px 10px; flex-shrink: 0; white-space: nowrap;
        }
        .n5-lesson-title { flex: 1; font-weight: 700; font-size: 14.5px; color: var(--heading); }
        .n5-lesson-body { padding: 0 16px 18px; border-top: 1px dashed var(--line); }
        .n5-sentence-list { display: flex; flex-direction: column; gap: 12px; }
        .n5-sentence-item { background: var(--paper); border-radius: 10px; padding: 12px 14px; }
        .n5-sentence-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .n5-sentence-jp { font-family: 'Noto Serif JP', serif; font-size: 17px; line-height: 2; color: var(--heading); }
        .n5-sentence-jp ruby rt { font-size: 10px; color: var(--muted-2); }
        .n5-speak-btn {
          flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--line);
          background: var(--paper-card); color: var(--ai); display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .n5-sentence-zh { font-size: 12.5px; color: var(--muted-1); margin-top: 4px; }

        .vocab-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .vocab-chip {
          display: flex; align-items: baseline; gap: 6px; background: rgba(226,112,58,0.1);
          border: 1px solid rgba(226,112,58,0.3); border-radius: 999px; padding: 5px 11px; font-size: 13px;
        }
        .vocab-chip ruby rt { font-size: 9px; }
        .vocab-chip-zh { font-size: 11px; color: var(--muted-1); }

        .pattern-chip {
          display: inline-block; background: rgba(36,68,110,0.08); color: var(--heading);
          padding: 1px 8px; border-radius: 999px; font-weight: 700; font-size: 12px;
        }
        .grammar-list { display: flex; flex-direction: column; gap: 8px; }
        .grammar-list-item { display: flex; flex-direction: column; gap: 4px; background: rgba(122,155,87,0.1); border-radius: 10px; padding: 10px 12px; }
        .grammar-list-note { font-size: 12.5px; color: var(--note-text); line-height: 1.5; }
        .grammar-note {
          margin-top: 10px; font-size: 12.5px; color: var(--note-text); background: rgba(122,155,87,0.16);
          border-radius: 8px; padding: 8px 10px; line-height: 1.5; text-align: left;
        }

        .empty-state { text-align: center; padding: 40px 0; color: var(--muted-2); }

        .tabs { display: flex; gap: 8px; margin: 4px 0 18px; }
        .tab-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 8px; border-radius: 10px; border: 1.5px solid var(--line);
          background: var(--paper-card); color: var(--ink); font-weight: 600; font-size: 13.5px;
          cursor: pointer; transition: all .15s ease;
        }
        .tab-btn.active { background: var(--ai); border-color: var(--ai); color: #fff; }

        .vocab-card-word {
          flex: 1; font-family: 'Noto Serif JP', serif; font-weight: 700; font-size: 17px; color: var(--heading);
          text-align: left;
        }
        .vocab-card-word ruby rt { font-size: 10px; color: var(--muted-2); }
        .vocab-card-zh-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .vocab-card-zh { font-size: 15px; color: var(--ink); }
        .vocab-card-source { margin-top: 10px; font-size: 11.5px; color: var(--muted-3); }
      `}</style>

      <div className="shell">
        <div className="header">
          <div className="header-top-row">
            <div className="eyebrow">每天讀新聞 · 練日文</div>
            <div className="header-top-right">
              {streak.count > 0 && <div className="streak-badge">🔥 連續 {streak.count} 天</div>}
              <button
                className="dark-toggle-btn"
                onClick={() => setDarkMode((d) => !d)}
                aria-label="切換深色模式"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
          <div className="title-row">
            <div className="title">ニュース手帳</div>
            <span className="hanko-stamp" aria-hidden="true">帳</span>
          </div>
          <div className="subtitle">上傳新聞截圖，自動整理單字、文法與延伸例句</div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${mode === "news" ? "active" : ""}`} onClick={() => setMode("news")}>
            <Camera size={16} /> 新聞分析
          </button>
          <button className={`tab-btn ${mode === "vocab" ? "active" : ""}`} onClick={() => setMode("vocab")}>
            <BookOpen size={16} /> 單字卡
          </button>
          <button className={`tab-btn ${mode === "grammar" ? "active" : ""}`} onClick={() => setMode("grammar")}>
            <PenLine size={16} /> 文法卡
          </button>
        </div>

        {mode === "news" && <NewsAnalyzer />}
        {mode === "vocab" && <VocabCards key={mode} />}
        {mode === "grammar" && <GrammarCards key={mode} />}
      </div>
    </div>
  );
}
