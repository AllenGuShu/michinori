import React, { useState } from "react";
import { ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { WordRuby } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { getAllVocab } from "../lib/newsArchive.js";

export default function VocabCards() {
  const [vocab] = useState(() => getAllVocab());
  const [openWord, setOpenWord] = useState(null);

  const toggle = (word) => setOpenWord((cur) => (cur === word ? null : word));

  if (vocab.length === 0) {
    return (
      <div className="empty-state">
        <p>還沒有累積到任何單字。<br />先去「新聞分析」上傳幾篇文章，這裡就會自動出現單字卡。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="n5-intro">📇 從你分析過的 {vocab.length} 個單字彙整而成，點卡片看意思與出處。</div>

      <div className="n5-lesson-list">
        {vocab.map((v) => {
          const isOpen = openWord === v.word;
          return (
            <div key={v.word} className="n5-lesson-card">
              <button className="n5-lesson-header" onClick={() => toggle(v.word)}>
                <span className="vocab-card-word">
                  <WordRuby word={v.word} reading={v.reading} />
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="n5-lesson-body">
                  <div className="vocab-card-zh-row">
                    <span className="vocab-card-zh">{v.zh}</span>
                    <button className="n5-speak-btn" onClick={() => speak(v.reading || v.word)} aria-label="播放發音">
                      <Volume2 size={16} />
                    </button>
                  </div>
                  {v.sourceTitle && (
                    <div className="vocab-card-source">
                      出自：{v.sourceTitle}（{v.sourceDate}）
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
