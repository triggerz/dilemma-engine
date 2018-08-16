import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import helper from './helper';

describe('helper', function () {
  it('should getOrderedSceneArray', () => {
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
    const answers = {nextScene: 'anotherChoice'};
    const sceneArray = helper.getOrderedSceneArray(config, answers);
    expect(sceneArray[1].hasAnswer).toEqual(true);
  });
});
