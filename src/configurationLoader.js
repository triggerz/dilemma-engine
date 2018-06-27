const R = require('ramda');
const parse = require('./mdconf');

export async function fetchMarkdownConfig(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`${url} could not be loaded`);
  }
  const markdown = await response.text();

  // When running locally, webpack will just return the bundle if the file is not found.
  if (markdown.indexOf('<!DOCTYPE HTML>') === 0) {
    throw new Error(`${url} not found`);
  }
  const o = parse(markdown, ['choice']);
  return o;
}

async function fetchMarkdownConfigFromFirstOf(urlList) {
  for (let i = 0; i < urlList.length; i++) {
    const url = urlList[i];
    try {
      const result = await fetchMarkdownConfig(url);
      return result;
    } catch (e) {}
  }

  throw new Error(`Could not find a file by the name of ${urlList.join(', ')}. Please note that file names are case sensitive.`);
}

export async function loadScene(configUrl, sceneId) {
  console.log('Loading scene ', sceneId);

  const rawScene = await fetchMarkdownConfigFromFirstOf([
    `${configUrl}scenes/${sceneId}.md`,
    `${configUrl}scenes/${sceneId}.md.txt`,
    `${configUrl}scenes/${sceneId}/index.md`,
    `${configUrl}scenes/${sceneId}/index.md.txt`
  ]);

  let subsequentSceneIds = [];
  if (rawScene.config && rawScene.config.next) {
    subsequentSceneIds = [rawScene.config.next];
  }

  const scene = {
    config: rawScene.config,
    description: rawScene.description,
    choices: rawScene.choices || []
  };

  return { scene, subsequentSceneIds };
}

async function loadConfig(configUrl, analysis) {
  let config;
  try {
    const rawConfig = await fetchMarkdownConfigFromFirstOf([`${configUrl}config.md`, `${configUrl}config.md.txt`]);

    if (!rawConfig.config) {
      throw new Error('Configuration file doesn\'t have a #Config section');
    } else if (Array.isArray(rawConfig.config)) {
      throw new Error('Configuration file must have exactly one #Config section');
    }

    config = rawConfig.config;
    const variables = R.map(v => Number(v || 0), rawConfig.variables);

    config.variables = variables;
    config.exports = rawConfig.exports;
    config.visible = rawConfig.visible;
    config.scenes = {};

    analysis.info.push({ message: `Variables: ${R.keys(variables).join(', ')}` });
  } catch(e) {
    analysis.errors.push(e);
  }

  return config;
}

export async function loadScenes(configUrl) {
  const analysis = {errors: [], warnings: [], info: []};
  const config = await loadConfig(configUrl, analysis);

  try {
    let unprocessedSceneIds = [config.initialScene];
    while(unprocessedSceneIds.length > 0) {
      const sceneId = unprocessedSceneIds[0];
      const { scene, subsequentSceneIds } = await loadScene(configUrl, sceneId);
      config.scenes[sceneId] = scene;

      unprocessedSceneIds = unprocessedSceneIds
      .concat(subsequentSceneIds)
      .filter(id => !config.scenes.hasOwnProperty(id));
    }
  } catch(e) {
    analysis.errors.push(e);
  }

  console.log(config);

  return {config, analysis};
}
