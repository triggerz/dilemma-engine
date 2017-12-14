const R = require('ramda');
const parse = require('./mdconf');

export async function fetchMarkdownConfig(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  const markdown = await response.text();

  // When running locally, webpack will just return the bundle if the file is not found.
  if (markdown.startsWith('<!DOCTYPE html>')) {
    throw new Error(`${url} not found`);
  }
  const o = parse(markdown);
  return o;
}

export async function loadScene(sceneId) {
  console.log('Loading scene ', sceneId);
  let rawScene;
  try {
    rawScene = await fetchMarkdownConfig(`scenes/${sceneId}.md`);
  } catch (e) { }

  if (!rawScene) {
    try {
      rawScene = await fetchMarkdownConfig(`scenes/${sceneId}/index.md`);
    } catch (e) { }
  }
    
  if (!rawScene) {
    throw new Error(`Could not find scene file as scenes/${sceneId}.md or scenes/${sceneId}/index.md. Note that scene names are case sensitive.`)
  }

  let subsequentSceneIds = [];
  if (rawScene.config && rawScene.config.next) {
    subsequentSceneIds = [rawScene.config.next];
  } else if (rawScene.choices) {
    subsequentSceneIds = Object.keys(rawScene.choices).map(c => rawScene.choices[c].next);
  } 

  const choiceCount = (rawScene.choice && rawScene.choice.length) || 0;
  const choices = R.range(0, choiceCount).map(index => ({ choice: rawScene.choice[index], feedback: rawScene.feedback[index], variables: rawScene.variables[index] }));

  const scene = {
    config: rawScene.config,
    description: rawScene.description,
    choices
  };

  return { scene, subsequentSceneIds };
}

export async function loadScenes(configUrl) {
  const {config, variables} = await fetchMarkdownConfig(configUrl);
  delete variables['(title)'];
  Object.keys(variables).forEach(v => variables[v] = +variables[v]);
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

  return config;
}
