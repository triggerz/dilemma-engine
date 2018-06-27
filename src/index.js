import React from 'react';
import ReactDOM from 'react-dom';
import 'url-search-params-polyfill';
import App from './App';
import AnalysisReport from './AnalysisReport';
import registerServiceWorker from './registerServiceWorker';
import { loadScenes } from './configurationLoader';
import { loadScenesFromSheet } from './sheetConfigurationLoader';

import pkg from '../package.json';

async function main() {
  const searchParams = new URLSearchParams(window.location.search);
  const uuid = searchParams.get('uuid');
  const isEmbedded = !!searchParams.get('embed');
  const analyze = !!searchParams.get('analyze');
  const configSheetId = searchParams.get('configSheetId');
  const configUrl = searchParams.get('configUrl') || window.configUrl || '';
  const responseUrl = searchParams.get('responseUrl');
  console.log(`## Dilemma engine v${pkg.version}: Running`);
  console.log(`Options: isEmbedded=${isEmbedded}, uuid=${uuid}, analyze=${analyze}, configSheetId=${configSheetId}, configUrl=${configUrl}, responseUrl=${responseUrl}`);
  
  let loaded;
  if (configSheetId) {
    console.log('Loading from google spreadsheet..');
    loaded = await loadScenesFromSheet(configSheetId);
  } else {
    console.log('Loading markdown config files..');
    loaded = await loadScenes(configUrl);
  }
  const {config, analysis} = loaded;

  if (typeof config.maxValue === 'undefined') {
    config.maxValue = 1;
  }

  if (analyze || analysis.errors.length > 0) {
    ReactDOM.render(<AnalysisReport analysis={analysis} />, document.getElementById('root'));
  } else {
    const options = { uuid, isEmbedded, responseUrl };
    ReactDOM.render(<App config={config} options={options} />, document.getElementById('root'));
  }
  registerServiceWorker();
}

main();
