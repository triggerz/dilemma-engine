import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import parse from './mdconf';

if (typeof window.configUrl === 'undefined') {
  window.configUrl = 'config.md';
}

console.log('Dilemma engine initialized');

async function fetchMarkdownConfig(url) {
  const markdown = await fetch(url).then(r => r.text());
  const o = parse(markdown);
  return o;
}

async function loadScenes() {
  const {config} = await fetchMarkdownConfig(window.configUrl);
  
  const initialScene = await fetchMarkdownConfig(`scenes/${config.initialScene}/index.md`);
  
  config.scenes = {};
  config.scenes[config.initialScene] = initialScene;
  
  let unprocessedScene = initialScene;
  while (unprocessedScene) {
    const nextSceneId = unprocessedScene.config && unprocessedScene.config.next;
    if (nextSceneId && !config.scenes.hasOwnProperty(nextSceneId)) {
      const nextScene = await fetchMarkdownConfig(`scenes/${nextSceneId}/index.md`);
      config.scenes[nextSceneId] = nextScene;
      unprocessedScene = nextScene;
    } else {
      unprocessedScene = null;
    }
  }

  console.log(config);
  return config;
}

async function main() {
  const config = await loadScenes();

  const searchParams = new URLSearchParams(window.location.search);
  const uuid = searchParams.get('uuid');
  const isEmbedded = !!searchParams.get('embed');
  const options = { uuid, isEmbedded };
  ReactDOM.render(<App config={config} options={options} />, document.getElementById('root'));
  registerServiceWorker();
}

main();
