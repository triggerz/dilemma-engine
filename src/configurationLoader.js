import parse from './mdconf';

export async function fetchMarkdownConfig(url) {
  const markdown = await fetch(url).then(r => r.text());
  const o = parse(markdown);
  return o;
}

export async function loadScene(sceneId) {
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