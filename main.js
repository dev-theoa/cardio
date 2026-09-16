import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import { html } from './lib/html.js'

const root = createRoot(document.getElementById('root'))
root.render(html`<${App} />`)
