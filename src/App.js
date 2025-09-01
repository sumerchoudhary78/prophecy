import React from 'react';
import ExcelGrid from './ExcelGrid';
import './App.css';

function App() {
  return (
    <div className="App">
      <header >
        <h1>excel for sheet</h1>
        <p>for sort function use to click on that perticular column or row and to insert row and column right click on the  column and row heading </p>
      </header>
      <main>
        <ExcelGrid rows={30} columns={25} />
      </main>
    </div>
  );
}

export default App;