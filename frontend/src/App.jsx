import React from 'react';

function App() {
  console.log("Nuclear App Test rendering...");
  return (
    <div style={{ padding: '100px', textAlign: 'center', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px', color: '#1e40af', fontWeight: '900' }}>VANTAGE: NUCLEAR TEST SUCCESS</h1>
      <p style={{ marginTop: '20px', color: '#64748b' }}>If you can see this, the JavaScript bundle is loading correctly.</p>
      <div style={{ marginTop: '50px', padding: '20px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
        Current Runtime: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

export default App;
