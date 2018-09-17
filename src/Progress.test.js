import React from 'react';
import { shallow } from 'enzyme';
import Progress from './Progress';

describe('render', () => {
  it('renders the progress thingy', () => {
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
    const wrapper = shallow(<Progress config={config} activeSceneId='nextScene' />);
    expect(wrapper.find('.progress').text()).toEqual('1/2');
  });
});
