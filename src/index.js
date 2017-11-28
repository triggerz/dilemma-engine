import React from 'react';
import ReactDOM from 'react-dom';
import parse from 'mdconf';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

if (typeof window.configUrl === 'undefined') {
  window.configUrl = 'config.json';
}

fetch(window.configUrl).then(r => r.json()).then(config => {
  fetch('scenes/intro/config.md').then(r => r.text()).then(configMarkdown => {
    console.log(parse(configMarkdown));
  })
  ReactDOM.render(<App config={config} />, document.getElementById('root'));
  registerServiceWorker();
});
