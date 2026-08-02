import React, { useState, useMemo } from "react";
import { X, BookOpen, PenLine } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { loadLearned, unmarkLearned } from "../lib/learned.js";
import { ALL_VOCAB } from "../data/vocab.js";
import { GRAMMAR_LIST } from "../data/grammar.js";

export default function LearnedSection() {
  const [data, setData] = useState(() => loadLearned());
  const [tab, setTab] = useState("vocab");
  const [expanded, setExpanded] = useState(null);

  const learnedVocab = useMemo(
    () => ALL_VOCAB.filter((v) => data.vocab[v.id]),
    [data]
  );
  const learnedGrammar = useMemo(
    () => GRAMMAR_LIST.filter((g) => data.grammar[g.id]),
    [data]
  );

  const removeVocab = (id) => {
    const next = unmarkLearned("vocab", id);
    setData({ ...next });
  };
  const removeGrammar = (id) => {
    const next = unmarkLearned("grammar", id);
    setData({ ...next });
  };

  const toggleExpand = (id) => setExpanded((e) => (e === id ? null : id));

  return (
    <div>
      <div className="learned-summary">
        <div className="learned-summary-item">
          <span className="learned-summary-num">{learnedVocab.length}</span>
          <span className="learned-summary-lbl">已學會的單字</span>
        </div>
        <div className="learned-summary-item">
          <span className="learned-summary-num">{learnedGrammar.length}</span>
          <span className="learned-summary-lbl">已學會的文法</span>
        </div>
      </div>

      <div className="cat-switch">
        <button className={`cat-btn ${tab === "vocab" ? "active" : ""}`} onClick={() => setTab("vocab")}>
          <BookOpen size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
          單字（{learnedVocab.length}）
        </button>
        <button className={`cat-btn ${tab === "grammar" ? "active" : ""}`} onClick={() => setTab("grammar")}>
          <PenLine size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
          文法（{learnedGrammar.length}）
        </button>
      </div>

      {tab === "vocab" && (
        <div className="learned-list">
          {learnedVocab.length === 0 && (
            <div className="empty-state">
              <p>還沒有標記「學會了」的單字。<br />在單字閃卡裡點「學會了」就會出現在這裡。</p>
            </div>
          )}
          {learnedVocab.map((v) => (
            <div key={v.id} className="learned-row" onClick={() => toggleExpand(v.id)}>
              <div className="learned-row-main">
                <span className="learned-row-kanji">{v.kanji}</span>
                <span className="learned-row-kana">{v.kana}</span>
                <span className="learned-row-zh">{v.zh}</span>
              </div>
              <button
                className="learned-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeVocab(v.id);
                }}
                aria-label="移除"
              >
                <X size={16} />
              </button>
              {expanded === v.id && (
                <div className="learned-row-detail">
                  <Furigana text={v.ex} />
                  <div className="learned-row-detail-zh">{v.exZh}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "grammar" && (
        <div className="learned-list">
          {learnedGrammar.length === 0 && (
            <div className="empty-state">
              <p>還沒有標記「確定學會」的文法。<br />在常用文法頁點「確定學會」就會出現在這裡。</p>
            </div>
          )}
          {learnedGrammar.map((g) => (
            <div key={g.id} className="learned-row" onClick={() => toggleExpand(g.id)}>
              <div className="learned-row-main">
                <span className="learned-row-kanji learned-row-pattern">{g.pattern}</span>
                <span className="learned-row-zh">{g.meaning}</span>
              </div>
              <button
                className="learned-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeGrammar(g.id);
                }}
                aria-label="移除"
              >
                <X size={16} />
              </button>
              {expanded === g.id && (
                <div className="learned-row-detail">
                  <Furigana text={g.example} />
                  <div className="learned-row-detail-zh">{g.exampleZh}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
