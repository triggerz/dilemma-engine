import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

if (typeof window.configUrl === 'undefined') {
  window.configUrl = 'config.json';
}

fetch(window.configUrl).then(r => r.json()).then(config => {
  console.log('Got config: ', config);
  
  ReactDOM.render(<App config={config} />, document.getElementById('root'));
  registerServiceWorker();
});
