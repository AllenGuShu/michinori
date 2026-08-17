import React, { useState } from "react";
import { ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { getAllGrammar } from "../lib/newsArchive.js";

export default function GrammarCards() {
  const [grammar] = useState(() => getAllGrammar());
  const [openPattern, setOpenPattern] = useState(null);

  const toggle = (pattern) => setOpenPattern((cur) => (cur === pattern ? null : pattern));

  if (grammar.length === 0) {
    return (
      <div className="empty-state">
        <p>還沒有累積到任何文法。<br />先去「新聞分析」上傳幾篇文章，這裡就會自動出現文法卡。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="n5-intro">📖 從你分析過的 {grammar.length} 個文法句型彙整而成，點卡片看例句與說明。</div>

      <div className="n5-lesson-list">
        {grammar.map((g) => {
          const isOpen = openPattern === g.pattern;
          return (
            <div key={g.pattern} className="n5-lesson-card">
              <button className="n5-lesson-header" onClick={() => toggle(g.pattern)}>
                <span className="vocab-card-word">{g.pattern}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="n5-lesson-body">
                  <div className="vocab-card-zh-row">
                    <span className="vocab-card-zh">{g.meaning}</span>
                  </div>
                  {g.note && <div className="grammar-note">📌 {g.note}</div>}

                  {g.example && (
                    <div className="n5-sentence-item" style={{ marginTop: 10 }}>
                      <div className="n5-sentence-row">
                        <div className="n5-sentence-jp"><Furigana text={g.example} /></div>
                        <button className="n5-speak-btn" onClick={() => speak(g.example)} aria-label="播放發音">
                          <Volume2 size={16} />
                        </button>
                      </div>
                      {g.exampleZh && <div className="n5-sentence-zh">{g.exampleZh}</div>}
                    </div>
                  )}

                  {g.sourceTitle && (
                    <div className="vocab-card-source">
                      出自：{g.sourceTitle}（{g.sourceDate}）
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
