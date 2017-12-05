import { loadScene, loadScenes } from './configurationLoader';

describe('loadScene', () => {
  it('loads and parses a basic scene from a markdown config file', async () => {
    const { scene, subsequentSceneIds } = await loadScene('basic');
    expect(scene).toHaveProperty('config');
    expect(scene.config.title).toEqual('Basic Scene');
    expect(scene.description['(text)']).toEqual(['This is a completely basic scene']);
    expect(subsequentSceneIds).toEqual([]);
  });

  it('finds the subsequent scene when there is just one', async () => {
    const { scene, subsequentSceneIds } = await loadScene('intro');
    expect(scene).toHaveProperty('config');
    expect(subsequentSceneIds).toEqual(['brad']);
  });

  it('loads a scene with choices and reports the correct subsequent scene ids', async () => {
    const { scene, subsequentSceneIds } = await loadScene('brad');
    const choiceKeys = Object.keys(scene.choices);
    
    expect(scene.choices[choiceKeys[0]]).toMatchObject({
      'time': '-1',
      'engagement': '-3',
      'performance': '-2',
      'total': 'round(((engagement * performance) / 100) - (100 - time))',
      'next': 'brad_a'
    });
    expect(subsequentSceneIds).toEqual(['brad_a', 'brad_b', 'brad_c', 'brad_d']);
  });
});

describe('loadScenes', () => {
  it('should load the config file trail of scenes from there', async () => {
    const config = await loadScenes('config.md');

    const sceneIds = Object.keys(config.scenes);
    expect(sceneIds).toEqual(['intro', 'brad', 'brad_a', 'brad_b', 'brad_c', 'brad_d']);
  });
});
