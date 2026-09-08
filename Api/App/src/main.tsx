import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// win95-ui's index pulls in React95's GlobalStyle and theme as side effects. Our Tailwind
// layer is imported after it so the @layer ordering is declared once both exist.
import '@duckdgoose/win95-ui'
import './styles.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
