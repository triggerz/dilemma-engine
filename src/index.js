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

async function loadScene(sceneId) {
  console.log('Loading scene ', sceneId);
  const scene = await fetchMarkdownConfig(`scenes/${sceneId}/index.md`);
  if (scene.choices) {
    delete scene.choices['(title)'];
  }

  let subsequentSceneIds = [];
  if (scene.config && scene.config.next) {
    subsequentSceneIds = [scene.config.next];
  } else if (scene.choices) {
    subsequentSceneIds = Object.keys(scene.choices).map(c => scene.choices[c].next);
  } 

  return { scene, subsequentSceneIds };
}

async function loadScenes() {
  const {config, variables} = await fetchMarkdownConfig(window.configUrl);
  delete variables['(title)'];
  config.variables = variables;
  config.scenes = {};
  
  let unprocessedSceneIds = [config.initialScene];

  while(unprocessedSceneIds.length > 0) {
    const sceneId = unprocessedSceneIds[0];
    const { scene, subsequentSceneIds } = await loadScene(sceneId);
    config.scenes[sceneId] = scene;

    unprocessedSceneIds = unprocessedSceneIds
      .concat(subsequentSceneIds)
      .filter(id => !config.scenes.hasOwnProperty(id));
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
