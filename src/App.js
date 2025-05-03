import React from 'react';
import BunqWrapped from './components/BunqWrapped';
import { FinancialDataProvider } from './backend/FinancialDataContext';
import './App.css';

function App() {
  return (
    <div className="App">
      <FinancialDataProvider>
        <BunqWrapped />
      </FinancialDataProvider>
    </div>
  );
}

export default App;