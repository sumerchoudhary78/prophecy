import React from 'react';
import ExcelGrid from './ExcelGrid';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <h1>Excel-like Grid Component</h1>
      </header> */}
      <main>
        <ExcelGrid rows={20} columns={15} />
      </main>
    </div>
  );
}

export default App;