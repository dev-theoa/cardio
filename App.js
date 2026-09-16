import { AuthProvider } from './lib/AuthContext.js'
import { ProtectedRoute } from './components/ProtectedRoute.js'
import { useHashRoute } from './lib/router.js'
import { html } from './lib/html.js'

import { LoginPage } from './pages/LoginPage.js'
import { RegisterPage } from './pages/RegisterPage.js'
import { HomePage } from './pages/HomePage.js'
import { AddVocabularyPage } from './pages/AddVocabularyPage.js'
import { ReviewImportPage } from './pages/ReviewImportPage.js'
import { LearnPage } from './pages/LearnPage.js'
import { ProfilePage } from './pages/ProfilePage.js'

export function App() {
  const route = useHashRoute()

  // Öffentliche Routen (kein Login nötig)
  if (route === '/login') {
    return html`<${AuthProvider}><${LoginPage} /><//>`
  }
  if (route === '/register') {
    return html`<${AuthProvider}><${RegisterPage} /><//>`
  }

  // /learn/STAPEL_ID -> Stapel-ID aus dem Pfad herauslesen
  const learnMatch = route.match(/^\/learn\/(.+)$/)
  if (learnMatch) {
    const stackId = learnMatch[1]
    return html`
      <${AuthProvider}>
        <${ProtectedRoute}><${LearnPage} stackId=${stackId} /><//>
      <//>
    `
  }

  const protectedRoutes = {
    '/': HomePage,
    '/add': AddVocabularyPage,
    '/review': ReviewImportPage,
    '/profile': ProfilePage,
  }

  const Page = protectedRoutes[route] || HomePage
  return html`
    <${AuthProvider}>
      <${ProtectedRoute}><${Page} /><//>
    <//>
  `
}
