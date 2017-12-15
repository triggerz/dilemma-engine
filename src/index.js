import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { loadScenes } from './configurationLoader';

if (typeof window.configUrl === 'undefined') {
  window.configUrl = 'config.md';
}

async function main() {
  const config = await loadScenes(window.configUrl);

  const searchParams = new URLSearchParams(window.location.search);
  const uuid = searchParams.get('uuid');
  const isEmbedded = !!searchParams.get('embed');
  const options = { uuid, isEmbedded };
  console.log(`## Dilemma engine: Running, embed=${isEmbedded}`)
  ReactDOM.render(<App config={config} options={options} />, document.getElementById('root'));
  registerServiceWorker();
}

main();
