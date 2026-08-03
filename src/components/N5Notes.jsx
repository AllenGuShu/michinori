import React, { useState } from "react";
import { ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { N5_LESSONS } from "../data/n5notes.js";

export default function N5Notes() {
  const lessons = [...N5_LESSONS].sort((a, b) => b.number - a.number);
  const [openId, setOpenId] = useState(lessons[0]?.id || null);

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  if (lessons.length === 0) {
    return (
      <div className="empty-state">
        <p>還沒有課程筆記，拍第一課給我之後就會出現在這裡。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="n5-intro">📔 跟著課本進度累積的 N5 筆記，拍照給我，我幫你整理成新的一課。</div>

      <div className="n5-lesson-list">
        {lessons.map((lesson) => {
          const isOpen = openId === lesson.id;
          return (
            <div key={lesson.id} className="n5-lesson-card">
              <button className="n5-lesson-header" onClick={() => toggle(lesson.id)}>
                <span className="n5-lesson-badge">Lesson {lesson.number}</span>
                <span className="n5-lesson-title">{lesson.title}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="n5-lesson-body">
                  <div className="n5-section-title">文法項目</div>
                  <div className="vocab-chip-row">
                    {lesson.grammarPoints.map((g, i) => (
                      <span key={i} className="pattern-chip n5-grammar-chip">{g}</span>
                    ))}
                  </div>

                  <div className="n5-section-title">重點句型</div>
                  <div className="n5-sentence-list">
                    {lesson.sentences.map((s, i) => (
                      <div key={i} className="n5-sentence-item">
                        <div className="n5-sentence-row">
                          <div className="n5-sentence-jp">
                            <Furigana text={s.jp} />
                          </div>
                          <button className="n5-speak-btn" onClick={() => speak(s.jp)} aria-label="播放發音">
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <div className="n5-sentence-zh">{s.zh}</div>
                        {s.note && <div className="grammar-note n5-sentence-note">📌 {s.note}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="n5-section-title">單字</div>
                  <div className="vocab-chip-row">
                    {lesson.vocab.map((v, i) => (
                      <span key={i} className="vocab-chip">
                        <ruby>{v.word}<rt>{v.reading}</rt></ruby>
                        <span className="vocab-chip-zh">{v.zh}</span>
                      </span>
                    ))}
                  </div>

                  {lesson.tips && lesson.tips.length > 0 && (
                    <>
                      <div className="n5-section-title">課本小提醒</div>
                      <div className="grammar-list">
                        {lesson.tips.map((t, i) => (
                          <div key={i} className="grammar-list-item n5-tip-item">
                            <div className="n5-tip-title">💡 {t.title}</div>
                            <div className="grammar-list-note">{t.content}</div>
                          </div>
                        ))}
                      </div>
                    </>
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
