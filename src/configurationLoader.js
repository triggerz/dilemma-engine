const R = require('ramda');
const parse = require('./mdconf');

export async function fetchMarkdownConfig(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  const markdown = await response.text();

  // When running locally, webpack will just return the bundle if the file is not found.
  if (markdown.indexOf('<!DOCTYPE HTML>') === 0) {
    throw new Error(`${url} not found`);
  }
  const o = parse(markdown);
  return o;
}

async function fetchMarkdownConfigFromFirstOf(urlList) {
  for (const url of urlList) {
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

  const choiceCount = (rawScene.choice && rawScene.choice.length) || 0;
  const choices = R.range(0, choiceCount).map(index => ({
    choice: rawScene.choice[index],
    feedback: rawScene.feedback[index],
    outcome: rawScene.outcome && rawScene.outcome[index],
    variables: rawScene.variables[index]
  }));

  const scene = {
    config: rawScene.config,
    description: rawScene.description,
    choices
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
    const variables = R.map(Number, rawConfig.variables);

    config.variables = variables;
    config.exports = rawConfig.exports;
    config.visible = rawConfig.visible;
    config.values = rawConfig.values;
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

  return {config, analysis};
}
