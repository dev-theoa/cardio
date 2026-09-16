// Ganz simpler Zwischenspeicher, um die erkannten Vokabeln von der
// Scan-Seite zur Überprüfungs-Seite zu tragen (Hash-Routing baut die
// Seite komplett neu auf, React-State geht also beim Wechsel verloren).
let pendingCards = null

export function setPendingCards(cards) {
  pendingCards = cards
}

export function takePendingCards() {
  const cards = pendingCards
  pendingCards = null
  return cards
}
