import React from 'react';
import ReactDOM from 'react-dom';
import 'url-search-params-polyfill';
import App from './App';
import AnalysisReport from './AnalysisReport';
import registerServiceWorker from './registerServiceWorker';
import { loadScenes } from './configurationLoader';

async function main() {
  const searchParams = new URLSearchParams(window.location.search);
  const uuid = searchParams.get('uuid');
  const isEmbedded = !!searchParams.get('embed');
  const analyze = !!searchParams.get('analyze');
  const configUrl = searchParams.get('configUrl') || window.configUrl || '';
  console.log(`## Dilemma engine: Running, embed=${isEmbedded}, uuid=${uuid}, analyze=${analyze}`);
  
  const {config, analysis} = await loadScenes(configUrl);

  if (typeof config.maxValue === 'undefined') {
    config.maxValue = 1;
  }

  if (analyze || analysis.errors.length > 0) {
    ReactDOM.render(<AnalysisReport analysis={analysis} />, document.getElementById('root'));
  } else {
    const options = { uuid, isEmbedded };
    ReactDOM.render(<App config={config} options={options} />, document.getElementById('root'));
  }
  registerServiceWorker();
}

main();
