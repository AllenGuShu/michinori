import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { ALL_VOCAB } from "../data/vocab.js";
import { GRAMMAR_LIST } from "../data/grammar.js";
import { N5_LESSONS } from "../data/n5notes.js";
import { N4_LESSONS } from "../data/n4notes.js";

const KANJI_RE = /[\u4e00-\u9faf々]/;
function showReading(word, reading) {
  return reading && word !== reading && KANJI_RE.test(word);
}

function flattenNotesVocab(lessons, typeLabel) {
  const out = [];
  lessons.forEach((lesson) => {
    (lesson.vocab || []).forEach((v) => {
      out.push({ type: typeLabel, word: v.word, reading: v.reading, zh: v.zh, extra: `Lesson ${lesson.number}` });
    });
  });
  return out;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const vocabResults = ALL_VOCAB.filter((v) =>
      [v.kanji, v.kana, v.zh, v.romaji].some((f) => f && f.toLowerCase().includes(q))
    )
      .slice(0, 8)
      .map((v) => ({ type: "單字", word: v.kanji, reading: v.kana, zh: v.zh, extra: v.theme }));

    const grammarResults = GRAMMAR_LIST.filter((g) =>
      [g.pattern, g.meaning].some((f) => f && f.toLowerCase().includes(q))
    )
      .slice(0, 5)
      .map((g) => ({ type: "文法", word: g.pattern, reading: "", zh: g.meaning, extra: g.level }));

    const n5Results = flattenNotesVocab(N5_LESSONS, "N5筆記")
      .filter((v) => [v.word, v.reading, v.zh].some((f) => f.toLowerCase().includes(q)))
      .slice(0, 5);

    const n4Results = flattenNotesVocab(N4_LESSONS, "N4筆記")
      .filter((v) => [v.word, v.reading, v.zh].some((f) => f.toLowerCase().includes(q)))
      .slice(0, 5);

    return [...vocabResults, ...grammarResults, ...n5Results, ...n4Results].slice(0, 20);
  }, [query]);

  return (
    <div className="search-bar-wrap">
      <div className="search-input-row">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="搜尋單字、文法、筆記..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear-btn" onClick={() => setQuery("")} aria-label="清除">
            <X size={14} />
          </button>
        )}
      </div>

      {query && (
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-empty">沒有找到符合的內容</div>
          ) : (
            results.map((r, i) => (
              <div key={i} className="search-result-row">
                <span className="search-result-type">{r.type}</span>
                <span className="search-result-word">{r.word}</span>
                {showReading(r.word, r.reading) && <span className="search-result-reading">{r.reading}</span>}
                <span className="search-result-zh">{r.zh}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
