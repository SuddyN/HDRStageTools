import React from 'react';
import logo from './logo.svg';
import './App.css';
import { lvdService } from './Services/LvdService';

function App() {
  const lvdMap = lvdService.readLvdFromUrl("https://suddyn.github.io/HDRStageTools/lvd/ultimate/lvd.zip")
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
