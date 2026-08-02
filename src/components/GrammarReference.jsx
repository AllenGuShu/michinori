import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Volume2, Check } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import RouteProgress from "./RouteProgress.jsx";
import { GRAMMAR_LIST } from "../data/grammar.js";
import { isLearned, markLearned, unmarkLearned } from "../lib/learned.js";

export default function GrammarReference() {
  const [index, setIndex] = useState(0);
  const [learned, setLearned] = useState(false);
  const total = GRAMMAR_LIST.length;
  const item = GRAMMAR_LIST[index];

  useEffect(() => {
    setLearned(isLearned("grammar", item.id));
  }, [item.id]);

  const prev = () => setIndex((i) => (i === 0 ? total - 1 : i - 1));
  const next = () => setIndex((i) => (i === total - 1 ? 0 : i + 1));

  const toggleLearned = () => {
    if (learned) {
      unmarkLearned("grammar", item.id);
      setLearned(false);
    } else {
      markLearned("grammar", item.id);
      setLearned(true);
    }
  };

  return (
    <div>
      <RouteProgress current={index} total={total} />
      <div className="deck-meta">
        常用文法 · {index + 1} / {total}
      </div>

      <div className="grammar-ref-card">
        <span className="level-tag">{item.level}</span>
        {learned && <span className="learned-tag">✅ 已學會</span>}
        <div className="grammar-ref-pattern">{item.pattern}</div>
        <div className="grammar-ref-meaning">{item.meaning}</div>

        <div className="example-box example-box-light">
          <div className="example-jp-dark">
            <Furigana text={item.example} />
          </div>
          <div className="example-zh-dark">{item.exampleZh}</div>
        </div>

        <div className="grammar-note grammar-note-light">📌 {item.note}</div>
      </div>

      <div className="card-controls">
        <button
          className="icon-btn"
          onClick={() => speak(item.example)}
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
      <button className={`btn learn-toggle-btn ${learned ? "btn-learned-active" : "btn-know"}`} onClick={toggleLearned}>
        <Check size={16} /> {learned ? "已學會（點擊取消）" : "確定學會，加入已學習"}
      </button>
    </div>
  );
}
