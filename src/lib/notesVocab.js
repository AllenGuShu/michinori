// 把 N5 / N4 筆記裡的單字轉換成單字卡系統看得懂的格式，
// 這樣筆記裡的單字就能拿去做閃卡練習、進間隔複習、標記已學會。

export function buildVocabCardsFromLessons(lessons, idPrefix) {
  const map = new Map();
  lessons.forEach((lesson) => {
    (lesson.vocab || []).forEach((v) => {
      const id = `${idPrefix}-${v.word}`;
      if (!map.has(id)) {
        map.set(id, {
          id,
          kanji: v.word,
          kana: v.reading,
          romaji: "",
          zh: v.zh,
          level: `L${lesson.number}`,
          theme: lesson.title,
        });
      }
    });
  });
  return Array.from(map.values());
}

export function buildVocabCardsFromLesson(lesson, idPrefix) {
  const map = new Map();
  (lesson.vocab || []).forEach((v) => {
    const id = `${idPrefix}-${v.word}`;
    if (!map.has(id)) {
      map.set(id, {
        id,
        kanji: v.word,
        kana: v.reading,
        romaji: "",
        zh: v.zh,
        level: `L${lesson.number}`,
        theme: lesson.title,
      });
    }
  });
  return Array.from(map.values());
}
