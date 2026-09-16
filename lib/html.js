// Kleiner Helfer: erlaubt JSX-ähnliche Syntax ganz ohne Babel/Build-Schritt.
// html`<div>Hallo ${name}</div>` wird direkt zu React.createElement-Aufrufen.
import React from 'react'
import htm from 'htm'

export const html = htm.bind(React.createElement)
