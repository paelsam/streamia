import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SharedStoreProvider } from '../../shell/src/store/SharedStore'
import '@streamia/shared/styles/index.scss'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SharedStoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SharedStoreProvider>
  </StrictMode>,
)
