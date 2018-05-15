import { loadScene, loadScenes } from './configurationLoader';

describe('loadScene', () => {
  it('loads and parses a basic scene from a markdown config file', async () => {
    const { scene, subsequentSceneIds } = await loadScene('', 'basic');
    expect(scene).toHaveProperty('config');
    expect(scene.config.title).toEqual('Basic Scene');
    expect(scene.description).toEqual('This is a completely basic scene');
    expect(subsequentSceneIds).toEqual([]);
  });

  it('finds the subsequent scene when there is just one', async () => {
    const { scene, subsequentSceneIds } = await loadScene('', 'intro');
    expect(scene).toHaveProperty('config');
    expect(subsequentSceneIds).toEqual(['brad']);
  });

  it('loads a scene with choices and reports the correct subsequent scene ids', async () => {
    const { scene, subsequentSceneIds } = await loadScene('', 'brad');

    expect(scene.choices.length).toEqual(4);
    expect(scene.choices[0]).toMatchObject({
      choice: 'You tell him exactly how you feel, and try to appeal to him to improve his behavior',
      variables: {
        'time': '-1'
      }
    });
  });

  it('loads a scene with various missing sections', async () => {
    const { scene } = await loadScene('', 'partial');

    expect(scene.choices.length).toEqual(4);
    expect(scene.choices[0]).toEqual({
      choice: 'This first choice has everything',
      variables: { x: '+1' },
      feedback: 'You did well',
      outcome: 'Everything\'s a bit better'
    });

    expect(scene.choices[1]).toEqual({
      choice: 'This second one is missing variables',
      feedback: '..but there is still feedback',
      outcome: 'And an outcome'
    });

    expect(scene.choices[2]).toEqual({
      choice: 'One missing everything'
    });

    expect(scene.choices[3]).toEqual({
      choice: 'And a last one with just some variables',
      variables: { x: '+2' }
    });
  });
});

describe('loadScenes', () => {
  it('should load the config file trail of scenes from there', async () => {
    const {config} = await loadScenes('');

    const sceneIds = Object.keys(config.scenes);
    expect(sceneIds).toEqual(['intro', 'brad']);
  });
});
