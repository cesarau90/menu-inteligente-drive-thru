import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/big-shoulders-display/600'
import '@fontsource/big-shoulders-display/800'
import '@fontsource/big-shoulders-display/900'
import '@fontsource/dm-mono/400'
import '@fontsource/dm-mono/500'
import '@fontsource/instrument-sans/500'
import '@fontsource/instrument-sans/600'
import '@fontsource/instrument-sans/700'
import './styles/tokens.css'
import './styles/display.css'
import './styles/panel.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
