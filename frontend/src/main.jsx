import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <>
      <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '5px 10px', backgroundColor: '#fbbf24', color: 'black', fontWeight: 'bold', zIndex: 99999, fontSize: '8px', borderRadius: '5px 0 0 0' }}>
        HYBRID_MOUNT_STABLE // v3.1
      </div>
      <App />
    </>
  )
}
