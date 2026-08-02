import React, { useState, useMemo, useRef, useCallback } from "react";
import { Volume2, Mic, Square, RotateCcw, ChevronRight } from "lucide-react";
import { Furigana, stripFurigana } from "../lib/furigana.jsx";
import { speak } from "../lib/speak.js";
import { similarity } from "../lib/similarity.js";
import RouteProgress from "./RouteProgress.jsx";
import { ALL_VOCAB } from "../data/vocab.js";
import { GRAMMAR_LIST } from "../data/grammar.js";

const ROUND_SIZE = 10;
const SentencePool = [
  ...ALL_VOCAB.map((v) => ({ id: v.id, jp: v.ex, zh: v.exZh })),
  ...GRAMMAR_LIST.map((g) => ({ id: g.id, jp: g.example, zh: g.exampleZh })),
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function SpeakingTrainer() {
  const SRCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const [round, setRound] = useState(() => shuffle(SentencePool).slice(0, ROUND_SIZE));
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const total = round.length;
  const item = round[index];
  const finished = index >= total;

  const startRecording = useCallback(() => {
    if (!SRCtor) return;
    setError("");
    setTranscript("");
    setScore(null);
    const recognition = new SRCtor();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const sim = similarity(text, stripFurigana(item.jp));
      setScore(sim);
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "沒有取得麥克風權限，請允許瀏覽器使用麥克風後再試一次。"
          : "語音辨識發生錯誤，請再試一次。"
      );
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [SRCtor, item]);

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setRecording(false);
  };

  const next = () => {
    setTranscript("");
    setScore(null);
    setError("");
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setRound(shuffle(SentencePool).slice(0, ROUND_SIZE));
    setIndex(0);
    setTranscript("");
    setScore(null);
    setError("");
  };

  if (!SRCtor) {
    return (
      <div className="empty-state">
        <p>
          這個瀏覽器不支援語音辨識功能 🙏
          <br />
          口說練習目前只在電腦版 Chrome、Android 版 Chrome 可以使用。
          <br />
          iPhone／iPad（Safari）目前還不支援，建議先用單字、文法、聽力等其他功能。
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="result-card">
        <h3>口說練習完成！</h3>
        <p className="explain-note" style={{ marginBottom: 16 }}>
          共練習了 {total} 句，繼續保持每天開口說幾句喔。
        </p>
        <div className="result-actions">
          <button className="btn btn-accent" onClick={restart}>
            <RotateCcw size={16} /> 換一組再練
          </button>
        </div>
      </div>
    );
  }

  const scorePct = score !== null ? Math.round(score * 100) : null;
  const scoreLabel = scorePct === null ? "" : scorePct >= 80 ? "很棒！發音很接近 🎉" : scorePct >= 50 ? "不錯，再更清楚一點 👍" : "再試一次，慢慢念看看 💪";

  return (
    <div>
      <RouteProgress current={index} total={total} />
      <div className="deck-meta">口說跟讀 · {index + 1} / {total}</div>

      <div className="grammar-ref-card">
        <div className="example-jp-dark" style={{ fontSize: 17 }}>
          <Furigana text={item.jp} />
        </div>
        <div className="example-zh-dark">{item.zh}</div>
      </div>

      <div className="card-controls">
        <button className="icon-btn" onClick={() => speak(item.jp)} aria-label="播放範例發音">
          <Volume2 size={20} />
        </button>
        {!recording ? (
          <button className="btn btn-know" onClick={startRecording}>
            <Mic size={16} /> 開始錄音
          </button>
        ) : (
          <button className="btn btn-miss" onClick={stopRecording}>
            <Square size={16} /> 停止錄音
          </button>
        )}
      </div>

      {error && <div className="grammar-note" style={{ marginTop: 12 }}>{error}</div>}

      {transcript && (
        <div className="speaking-result">
          <div className="speaking-result-row">
            <span className="speaking-result-label">辨識到：</span>
            <span>{transcript}</span>
          </div>
          {scorePct !== null && (
            <div className="speaking-score">
              <div className="speaking-score-bar">
                <div className="speaking-score-fill" style={{ width: `${scorePct}%` }} />
              </div>
              <div className="speaking-score-label">{scoreLabel}（相似度 {scorePct}%）</div>
            </div>
          )}
          <button className="btn btn-accent next-btn" onClick={next}>
            下一句 <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
