import React from 'react';
import localStorage from './localStorage';

describe('localStorage', function () {
  beforeEach(() => {
    this.uuid = 'someUuid';
    let store = {"dilemma[someUuid]": JSON.stringify({nextScene: 'anotherChoice'})};
    window.localStorage = {
      setItem: (key, value) => { store[key] = value + '' },
      getItem: key => store[key]
    };
  });
  it('should getAllAnswersFromLocalStorage', () => {
    const answers = localStorage.getAllAnswersFromLocalStorage(this.uuid);
    expect(answers).toEqual({"nextScene": "anotherChoice"});
  });

  it('should saveToLocalStorage', () => {
    const selectedChoice = 'someChoice';
    const activeSceneId = 'nextScene';
    localStorage.saveToLocalStorage(selectedChoice, activeSceneId, this.uuid);
    const answers = localStorage.getAllAnswersFromLocalStorage(this.uuid);
    expect(answers).toEqual({"nextScene": "someChoice"});
  });

  it('should getAnswerFromLocalStorage', () => {
    const answers = localStorage.getAnswerFromLocalStorage('nextScene', this.uuid);
    expect(answers).toEqual('anotherChoice');
  });

  it('should getInitialScene', () => {
    const config = {
      initialScene: 'initialScene',
      scenes: {
        initialScene: {
          config: {next: 'nextScene'},
          choices: []
        },
        nextScene: {
          config: {next: 'anotherScene'},
          choices: ['someChoice', 'anotherChoice']
        },
        anotherScene: {
          config: {next: 'lastScene'},
          choices: []
        },
        lastScene: {
          config: {},
          choices: ['someChoice', 'anotherChoice']
        },
      },
    };
    const initialScene = localStorage.getInitialScene(config, this.uuid);
    expect(initialScene).toEqual('anotherScene');
  });
});
