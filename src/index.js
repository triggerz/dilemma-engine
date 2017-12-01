import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import parse from './mdconf';

if (typeof window.configUrl === 'undefined') {
  window.configUrl = 'config.md';
}

console.log('Dilemma engine initialized');

fetch(window.configUrl).then(r => r.text()).then(configMarkdown => {
  const config = parse(configMarkdown);
  ReactDOM.render(<App config={config} />, document.getElementById('root'));
  registerServiceWorker();
});
