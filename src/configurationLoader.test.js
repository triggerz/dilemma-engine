import { loadScene, loadScenes } from './configurationLoader';

describe('loadScene', () => {
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

  it('loads a scene with choices and reports the correct subsequent scene ids', async () => {
    fetch.mockResponse(`# Config
 - Title: Initial Scene
 
# Description
This scene introduces the dilemma.

# Choices
## First choice
 - next: first

## Second choice
 - next: second `);

    const { scene, subsequentSceneIds } = await loadScene('initialScene');
    expect(scene.choices).toEqual({
      firstChoice: { '(title)': 'First choice', next: 'first' },
      secondChoice: { '(title)': 'Second choice', next: 'second' }
    })
    expect(subsequentSceneIds).toEqual(['first', 'second']);
  });
});
