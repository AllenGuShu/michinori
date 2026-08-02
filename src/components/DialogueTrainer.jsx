import React, { useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { Furigana } from "../lib/furigana.jsx";
import RouteProgress from "./RouteProgress.jsx";
import { DIALOGUES } from "../data/dialogues.js";

export default function DialogueTrainer() {
  const [scenario, setScenario] = useState(null);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState(0);

  const openScenario = (s) => {
    setScenario(s);
    setStep(0);
    setSelected(null);
    setCorrectCount(0);
    setUserAnswers(0);
  };

  const backToList = () => setScenario(null);

  if (!scenario) {
    return (
      <div className="scenario-list">
        {DIALOGUES.map((s) => (
          <button key={s.id} className="scenario-card" onClick={() => openScenario(s)}>
            <span className="scenario-icon">{s.icon}</span>
            <span className="scenario-info">
              <span className="scenario-title">{s.title}</span>
              <span className="scenario-theme">{s.theme} · {s.lines.length} 句對話</span>
            </span>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    );
  }

  const line = scenario.lines[step];
  const finished = step >= scenario.lines.length;

  if (finished) {
    return (
      <div className="result-card">
        <h3>「{scenario.title}」完成！</h3>
        <div className="result-stats">
          <div><span className="num">{correctCount}</span><span className="lbl">答對</span></div>
          <div><span className="num">{userAnswers}</span><span className="lbl">共作答</span></div>
        </div>
        <div className="result-actions">
          <button className="btn btn-accent" onClick={() => openScenario(scenario)}>
            <RotateCcw size={16} /> 重新練習
          </button>
          <button className="btn btn-ghost" onClick={backToList}>
            回情境列表
          </button>
        </div>
      </div>
    );
  }

  const advance = () => {
    setSelected(null);
    setStep((s) => s + 1);
  };

  const choose = (i) => {
    if (selected !== null) return;
    setSelected(i);
    setUserAnswers((n) => n + 1);
    if (i === 0) setCorrectCount((c) => c + 1);
  };

  return (
    <div>
      <div className="scenario-header">
        <button className="back-link" onClick={backToList}>← 情境列表</button>
        <span className="scenario-header-title">{scenario.icon} {scenario.title}</span>
      </div>
      <RouteProgress current={step} total={scenario.lines.length} />

      <div className="dialogue-scroll">
        {scenario.lines.slice(0, step).map((l, i) => (
          <div key={i} className={`bubble-row ${l.speaker === "user" ? "row-user" : "row-other"}`}>
            <div className={`bubble ${l.speaker === "user" ? "bubble-user" : "bubble-other"}`}>
              <div className="bubble-jp"><Furigana text={l.jp} /></div>
              <div className="bubble-zh">{l.zh}</div>
            </div>
          </div>
        ))}
      </div>

      {line.speaker === "other" ? (
        <div className="dialogue-current">
          <div className="bubble bubble-other bubble-current">
            <div className="bubble-jp"><Furigana text={line.jp} /></div>
            <div className="bubble-zh">{line.zh}</div>
          </div>
          <button className="btn btn-accent next-btn" onClick={advance}>
            繼續 <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="dialogue-current">
          <div className="prompt-text">換你說說看，該選哪一句？</div>
          <div className="options">
            {line.options.map((opt, i) => {
              let cls = "option-btn";
              if (selected !== null) {
                if (i === 0) cls += " option-correct";
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
            <button className="btn btn-accent next-btn" onClick={advance}>
              繼續 <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
