import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

export default function GrammarTrainer({ deck, catLabel }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
  }, [deck]);

  const q = deck[index];
  const finished = index >= deck.length;

  const choose = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
  };

  if (deck.length === 0) {
    return (
      <div className="empty-state">
        <p>這個分類目前沒有題目。</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="result-card">
        <h3>{catLabel}文法組完成！</h3>
        <div className="result-stats">
          <div><span className="num">{correctCount}</span><span className="lbl">答對</span></div>
          <div><span className="num">{deck.length - correctCount}</span><span className="lbl">答錯</span></div>
        </div>
        <div className="result-actions">
          <button className="btn btn-ghost" onClick={restart}>
            <RotateCcw size={16} /> 重新測驗
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RouteProgress current={index} total={deck.length} />
      <div className="deck-meta">
        {catLabel} · {index + 1} / {deck.length} · <span className="pattern-chip">{q.pattern}</span>
      </div>

      <div className="grammar-card">
        <span className="level-tag">{q.level}</span>
        <p className="sentence">{q.sentence}</p>
        <div className="options">
          {q.options.map((opt, i) => {
            let cls = "option-btn";
            if (selected !== null) {
              if (i === q.answer) cls += " option-correct";
              else if (i === selected) cls += " option-wrong";
            }
            return (
              <button key={i} className={cls} onClick={() => choose(i)} disabled={selected !== null}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="explain">
            <p className="explain-zh">{q.zh}</p>
            <p className="explain-note">{q.note}</p>
            <button className="btn btn-accent next-btn" onClick={next}>
              下一題 <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
