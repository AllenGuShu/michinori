import React, { useState, useMemo, useCallback } from "react";
import { Volume2, RotateCcw, ChevronRight } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import RouteProgress from "./RouteProgress.jsx";
import { ALL_VOCAB } from "../data/vocab.js";

const ROUND_SIZE = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound() {
  const picked = shuffle(ALL_VOCAB).slice(0, ROUND_SIZE);
  return picked.map((card) => {
    const distractorPool = ALL_VOCAB.filter((v) => v.id !== card.id && v.zh !== card.zh);
    const distractors = shuffle(distractorPool).slice(0, 2).map((v) => v.zh);
    const options = shuffle([card.zh, ...distractors]);
    return { card, options, answer: card.zh };
  });
}

export default function ListeningTrainer() {
  const [round, setRound] = useState(() => buildRound());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const total = round.length;
  const q = round[index];
  const finished = index >= total;

  const playAudio = useCallback(() => {
    if (q) speak(q.card.ex);
    setHasPlayed(true);
  }, [q]);

  const choose = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === q.answer) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    setSelected(null);
    setHasPlayed(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setRound(buildRound());
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setHasPlayed(false);
  };

  if (finished) {
    return (
      <div className="result-card">
        <h3>聽力訓練完成！</h3>
        <div className="result-stats">
          <div><span className="num">{correctCount}</span><span className="lbl">答對</span></div>
          <div><span className="num">{total - correctCount}</span><span className="lbl">答錯</span></div>
        </div>
        <div className="result-actions">
          <button className="btn btn-accent" onClick={restart}>
            <RotateCcw size={16} /> 換一組再聽
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RouteProgress current={index} total={total} />
      <div className="deck-meta">聽力訓練 · {index + 1} / {total}</div>

      <div className="listening-card">
        <button className="listen-play-btn" onClick={playAudio} aria-label="播放發音">
          <Volume2 size={32} />
        </button>
        <div className="listening-hint">
          {hasPlayed ? "再聽一次，或直接選答案" : "點喇叭聽這句日文"}
        </div>

        {selected !== null && (
          <div className="listening-transcript">
            <Furigana text={q.card.ex} />
          </div>
        )}
      </div>

      <div className="options">
        {q.options.map((opt, i) => {
          let cls = "option-btn";
          if (selected !== null) {
            if (opt === q.answer) cls += " option-correct";
            else if (opt === selected) cls += " option-wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => choose(opt)} disabled={selected !== null}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button className="btn btn-accent next-btn" onClick={next}>
          下一題 <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
