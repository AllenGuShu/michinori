import { stripFurigana } from "./furigana.jsx";

export function speak(text) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(stripFurigana(text));
    utter.lang = "ja-JP";
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    /* 此瀏覽器不支援語音合成，靜默略過 */
  }
}
