import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40px', backgroundColor: '#fbbf24', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 99999, fontSize: '12px' }}>
        DEBUG: main.jsx is mounting App (Vantage v3.1) - Logic Probe Active
      </div>
      <div style={{ paddingTop: '40px' }}>
        <App />
      </div>
    </StrictMode>
  )
} else {
  console.error("FATAL: Root element not found in DOM");
}
