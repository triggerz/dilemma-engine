import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

if (typeof window.configUrl === 'undefined') {
  window.configUrl = 'config.json';
}

console.log('Dilemma engine initialized');

fetch(window.configUrl).then(r => r.json()).then(config => {
  ReactDOM.render(<App config={config} />, document.getElementById('root'));
  registerServiceWorker();
});
