import { loadScene, loadScenes } from './configurationLoader';

it('loads and parses a scene from a markdown config file', async () => {
  fetch.mockResponse(`# Config
 - Title: Initial Scene
 - next: scene2
 
# Description
This scene introduces the dilemma.`);

  const { scene, subsequentSceneIds } = await loadScene('initialScene');
  expect(scene).toHaveProperty('config');
  expect(scene.config.title).toEqual('Initial Scene');
  expect(scene.description['(text)']).toEqual(['This scene introduces the dilemma.']);
  expect(subsequentSceneIds).toEqual(['scene2']);
});
