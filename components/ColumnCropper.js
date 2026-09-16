import { useEffect, useRef, useState } from 'react'
import { createWorker } from 'tesseract.js'
import { html } from '../lib/html.js'

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

// Zeigt das ausgewählte Foto mit zwei verschiebbaren/größenveränderbaren Kästen an.
// Nach Bestätigung wird nur der Bildausschnitt jeder Box per OCR gelesen -
// das ist deutlich präziser als das ganze Bild auf einmal zu erkennen.
export function ColumnCropper({ file, onCancel, onConfirm }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const dragRef = useRef(null)

  const [imageUrl, setImageUrl] = useState(null)
  const [boxes, setBoxes] = useState({
    front: { x: 4, y: 8, w: 42, h: 84 },
    back: { x: 54, y: 8, w: 42, h: 84 },
  })
  const [working, setWorking] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handlePointerMove(e) {
    const drag = dragRef.current
    if (!drag || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dxPercent = ((e.clientX - drag.startClientX) / rect.width) * 100
    const dyPercent = ((e.clientY - drag.startClientY) / rect.height) * 100

    setBoxes((prev) => {
      const b = { ...drag.startBox }
      if (drag.mode === 'move') {
        b.x = clamp(b.x + dxPercent, 0, 100 - b.w)
        b.y = clamp(b.y + dyPercent, 0, 100 - b.h)
      } else {
        b.w = clamp(b.w + dxPercent, 5, 100 - b.x)
        b.h = clamp(b.h + dyPercent, 5, 100 - b.y)
      }
      return { ...prev, [drag.key]: b }
    })
  }

  function handlePointerUp() {
    dragRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  function startDrag(key, mode, e) {
    e.preventDefault()
    dragRef.current = {
      key,
      mode,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startBox: { ...boxes[key] },
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  function cropToCanvas(image, box) {
    const sx = (box.x / 100) * image.naturalWidth
    const sy = (box.y / 100) * image.naturalHeight
    const sw = (box.w / 100) * image.naturalWidth
    const sh = (box.h / 100) * image.naturalHeight
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(sw))
    canvas.height = Math.max(1, Math.round(sh))
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    return canvas
  }

  async function handleRecognize() {
    setError('')
    setWorking(true)
    try {
      const image = imgRef.current
      const frontCanvas = cropToCanvas(image, boxes.front)
      const backCanvas = cropToCanvas(image, boxes.back)

      const worker = await createWorker('deu')

      setProgressText('Erkenne Vorderseiten-Spalte…')
      const frontResult = await worker.recognize(frontCanvas)

      setProgressText('Erkenne Rückseiten-Spalte…')
      const backResult = await worker.recognize(backCanvas)

      await worker.terminate()

      const frontLines = frontResult.data.text.split('\n').map((l) => l.trim()).filter(Boolean)
      const backLines = backResult.data.text.split('\n').map((l) => l.trim()).filter(Boolean)

      const count = Math.max(frontLines.length, backLines.length)
      const cards = []
      for (let i = 0; i < count; i++) {
        cards.push({ front: frontLines[i] || '', back: backLines[i] || '' })
      }

      if (cards.length === 0) {
        setError('In keiner der beiden markierten Spalten konnte Text erkannt werden.')
        return
      }

      onConfirm(cards)
    } catch (err) {
      console.error(err)
      setError('Texterkennung ist fehlgeschlagen. Bitte versuch es erneut.')
    } finally {
      setWorking(false)
      setProgressText('')
    }
  }

  function renderBox(key, label, colorClass) {
    const b = boxes[key]
    return html`
      <div
        class="crop-box ${colorClass}"
        style=${{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
        onPointerDown=${(e) => startDrag(key, 'move', e)}
      >
        <span class="crop-box-label">${label}</span>
        <div
          class="crop-box-handle"
          onPointerDown=${(e) => {
            e.stopPropagation()
            startDrag(key, 'resize', e)
          }}
        ></div>
      </div>
    `
  }

  return html`
    <div class="cropper-overlay">
      <div class="cropper-panel">
        <h2>Spalten markieren</h2>
        <p class="hint">
          Verschiebe die beiden Kästen über die Vorderseiten- bzw. Rückseiten-Spalte.
          Am Eck-Griff (unten rechts im Kasten) kannst du die Größe anpassen.
        </p>

        <div class="cropper-image-container" ref=${containerRef}>
          <img ref=${imgRef} src=${imageUrl} class="cropper-image" draggable="false" />
          ${renderBox('front', 'Vorderseite', 'crop-box-front')}
          ${renderBox('back', 'Rückseite', 'crop-box-back')}
        </div>

        ${error && html`<p class="error">${error}</p>`}
        ${working && html`<p class="hint">${progressText || 'Wird erkannt…'}</p>`}

        <div class="cropper-actions">
          <button type="button" class="secondary-btn" onClick=${onCancel} disabled=${working}>
            Abbrechen
          </button>
          <button type="button" class="primary-btn" onClick=${handleRecognize} disabled=${working}>
            ${working ? 'Wird erkannt…' : 'Text erkennen'}
          </button>
        </div>
      </div>
    </div>
  `
}
