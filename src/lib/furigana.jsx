import React from "react";

/* 假名標註（ふりがな）小工具
   標記格式：漢字[讀音]，例如 "食[た]べます" */

export function Furigana({ text }) {
  const regex = /([\u4e00-\u9faf々]+)\[([^\]]+)\]/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    nodes.push(
      <ruby key={key++}>
        {match[1]}
        <rt>{match[2]}</rt>
      </ruby>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return <>{nodes}</>;
}

export function stripFurigana(text) {
  return text.replace(/\[[^\]]+\]/g, "");
}

const KANJI_RE = /[\u4e00-\u9faf々]/;

// 用於單字晶片(chip)顯示：只有含漢字、且讀音跟原文不同時才標注音，
// 純假名／片假名單字（如 あなた、デザイナー）就不會重複顯示一樣的字。
export function WordRuby({ word, reading }) {
  if (!reading || word === reading || !KANJI_RE.test(word)) {
    return <>{word}</>;
  }
  return (
    <ruby>
      {word}
      <rt>{reading}</rt>
    </ruby>
  );
}
