import { createWorker } from 'tesseract.js'

// Erkennt Text aus einer Bilddatei und gibt die Zeilen mit Wort-Positionen zurück
// (statt nur reinem Text) - die Positionen brauchen wir, um Spalten zu erkennen.
export async function recognizeLines(file, onProgress) {
  const worker = await createWorker('deu', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })
  try {
    const { data } = await worker.recognize(file)
    return data.lines || []
  } finally {
    await worker.terminate()
  }
}

// Versucht pro Zeile, zwei Spalten (Vorderseite / Rückseite) zu erkennen,
// indem die größte horizontale Lücke zwischen zwei Wörtern gesucht wird.
// Ist die Lücke deutlich größer als die normalen Wortabstände in der Zeile,
// gilt sie als Spaltentrenner. Sonst landet die ganze Zeile in "front".
export function parseColumnsToCards(lines) {
  const cards = []

  for (const line of lines) {
    const text = (line.text || '').trim()
    if (!text) continue

    const words = (line.words || []).filter((w) => w.text && w.text.trim())

    if (words.length < 2) {
      cards.push({ front: text, back: '' })
      continue
    }

    // Lücken zwischen aufeinanderfolgenden Wörtern berechnen
    let maxGap = -Infinity
    let splitIndex = -1
    const gaps = []

    for (let i = 1; i < words.length; i++) {
      const gap = words[i].bbox.x0 - words[i - 1].bbox.x1
      gaps.push(gap)
      if (gap > maxGap) {
        maxGap = gap
        splitIndex = i
      }
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length

    // Nur als Spaltentrenner werten, wenn die Lücke deutlich (min. 2.5x)
    // größer ist als der durchschnittliche Wortabstand in der Zeile.
    if (splitIndex > 0 && maxGap > avgGap * 2.5 && maxGap > 15) {
      const front = words
        .slice(0, splitIndex)
        .map((w) => w.text)
        .join(' ')
        .trim()
      const back = words
        .slice(splitIndex)
        .map((w) => w.text)
        .join(' ')
        .trim()
      cards.push({ front, back })
    } else {
      cards.push({ front: text, back: '' })
    }
  }

  return cards
}
