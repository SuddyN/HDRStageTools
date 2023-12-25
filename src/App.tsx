import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as yaml from 'js-yaml';
import { galaxy00 } from './Types/galaxy00';

function App() {
  try {
    const doc = yaml.load(galaxy00);
    console.log(doc);
  } catch (e) {
    console.log(e);
  }
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
