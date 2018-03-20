import React from 'react';
import ReactDOM from 'react-dom';
import 'url-search-params-polyfill';
import App from './App';
import AnalysisReport from './AnalysisReport';
import registerServiceWorker from './registerServiceWorker';
import { loadScenes } from './configurationLoader';

if (typeof window.configUrl === 'undefined') {
  window.configUrl = 'config.md';
}

async function main() {
  const searchParams = new URLSearchParams(window.location.search);
  const uuid = searchParams.get('uuid');
  const isEmbedded = !!searchParams.get('embed');
  const analyze = !!searchParams.get('analyze');
  console.log(`## Dilemma engine: Running, embed=${isEmbedded}, uuid=${uuid}, analyze=${analyze}`);
  
  const {config, analysis} = await loadScenes(window.configUrl);
  if (analyze || analysis.errors.length > 0) {
    ReactDOM.render(<AnalysisReport analysis={analysis} />, document.getElementById('root'));
  } else {
    const options = { uuid, isEmbedded };
    ReactDOM.render(<App config={config} options={options} />, document.getElementById('root'));
  }
  registerServiceWorker();
}

main();
