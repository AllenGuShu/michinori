import React, { useState, useMemo, useCallback } from "react";
import { ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { similarity } from "../lib/similarity.js";
import RouteProgress from "./RouteProgress.jsx";
import { ALL_VOCAB } from "../data/vocab.js";

const ROUND_SIZE = 10;
const CORRECT_THRESHOLD = 0.75;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 只挑「例句裡確實逐字出現該單字辭書形」的資料，避免動詞變化型態誤判
function buildClozePool() {
  return ALL_VOCAB.filter((v) => v.ex && v.ex.includes(`${v.kanji}[${v.kana}]`)).map((v) => ({
    ...v,
    blanked: v.ex.replace(`${v.kanji}[${v.kana}]`, "＿＿＿＿"),
  }));
}

function buildRound() {
  return shuffle(buildClozePool()).slice(0, ROUND_SIZE);
}

export default function ClozeTrainer() {
  const [round] = useState(() => buildRound());
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);

  const total = round.length;
  const q = round[index];
  const finished = index >= total;

  const check = useCallback(() => {
    if (!q || checked) return;
    const simKanji = similarity(input, q.kanji);
    const simKana = similarity(input, q.kana);
    const ok = Math.max(simKanji, simKana) >= CORRECT_THRESHOLD;
    setLastCorrect(ok);
    if (ok) setCorrectCount((c) => c + 1);
    setChecked(true);
  }, [q, input, checked]);

  const next = () => {
    setInput("");
    setChecked(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    window.location.reload(); // 簡單作法：重新整理即可重新抽一輪新題目
  };

  if (round.length === 0) {
    return (
      <div className="empty-state">
        <p>目前沒有適合出題的例句，晚點再回來看看。</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="result-card">
        <h3>造句練習完成！</h3>
        <div className="result-stats">
          <div><span className="num">{correctCount}</span><span className="lbl">答對</span></div>
          <div><span className="num">{total - correctCount}</span><span className="lbl">答錯</span></div>
        </div>
        <div className="result-actions">
          <button className="btn btn-accent" onClick={restart}>
            <RotateCcw size={16} /> 換一組再練
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RouteProgress current={index} total={total} />
      <div className="deck-meta">造句練習 · {index + 1} / {total}</div>

      <div className="cloze-card">
        <div className="cloze-hint">看中文，把空格處的日文打出來（漢字或假名都可以）</div>
        <div className="cloze-zh">{q.exZh}</div>
        <div className="cloze-sentence">
          <Furigana text={q.blanked} />
        </div>
        <div className="cloze-answer-hint">提示：{q.zh}</div>
      </div>

      {!checked ? (
        <div className="cloze-input-row">
          <input
            className="cloze-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="輸入答案..."
            autoFocus
          />
          <button className="btn btn-accent" onClick={check}>對答案</button>
        </div>
      ) : (
        <div className={`cloze-result ${lastCorrect ? "cloze-result-correct" : "cloze-result-wrong"}`}>
          <div className="cloze-result-title">{lastCorrect ? "✓ 答對了！" : "✗ 再加油"}</div>
          <div className="cloze-result-answer">
            正確答案：<ruby>{q.kanji}<rt>{q.kana}</rt></ruby>
          </div>
          <div className="cloze-full-sentence">
            <Furigana text={q.ex} />
            <button className="n5-speak-btn" onClick={() => speak(q.ex)} aria-label="播放發音" style={{ marginLeft: 8 }}>
              <Volume2 size={14} />
            </button>
          </div>
          <button className="btn btn-accent next-btn" onClick={next}>
            下一題 <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
