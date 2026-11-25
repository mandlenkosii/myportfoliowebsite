import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// A little hello for anyone who opens the console.
console.log(
  `%c👋 Hey, curious developer.%c
This site is React + Three.js. Source: https://github.com/mandlenkosii/myportfoliowebsite
Try Ctrl/Cmd + K, or click a planet in the galaxy.`,
  'font: 600 14px system-ui; color: #6b8cff',
  'font: 12px ui-monospace, monospace; color: inherit',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
