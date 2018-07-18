import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import Scene from './Scene';
import Gauge from 'react-svg-gauge';

it('renders the initial scene with the proper variables', () => {
  const sceneConfig = {
    config: {
      title: 'Some Scene'
    },
    description: 'This scene is for testing',
    choices: []
  };
  const variables = {
    'a': 10,
    'b': 50,
    'c': 90
  };
  const wrapper = shallow(<Scene config={sceneConfig} variables={variables} />);

  expect(wrapper.find(Gauge)).toHaveLength(3);
  const gauge1 = wrapper.find(Gauge).at(0).props();
  const gauge2 = wrapper.find(Gauge).at(1).props();
  const gauge3 = wrapper.find(Gauge).at(2).props();

//  expect(gauge1).toMatchObject({ value: 10, label: 'a', color: 'rgb(229, 26, 0)' });
//  expect(gauge2).toMatchObject({ value: 50, label: 'b', color: 'rgb(127, 128, 0)' });
//  expect(gauge3).toMatchObject({ value: 90, label: 'c', color: 'rgb(25, 230, 0)' });
});

it('should adjust variables according to rules when choosing', () => {
  const sceneConfig = {
    config: {
      title: 'Some Scene',
      next: 'first'
    },
    description: 'This scene is for testing',
    choices: [
      {
        choice: 'first',
        feedback: 'Good job',
        outcome: 'Everybody is happy',
        variables: {
          a: '+10',
          b: '-10',
          c: 'round(a*b/7)'
        }
      }
    ]
  };
  const variables = {
    'a': 10,
    'b': 50,
    'c': 90
  };
  const options = {
    uuid: 'Some uuid'
  };
  let nextSceneId = 'Not updated yet';
  const wrapper = shallow(<Scene config={sceneConfig} variables={variables} onNavigate={(sceneId => nextSceneId = sceneId)} options={options} />);
  let store = {};
  window.localStorage = {
    setItem: (key, value) => { store[key] = value + '' },
    getItem: key => store[key]
  };

  wrapper.find('input#choice-0').simulate('change', {target: { value: '0' } });
  wrapper.find('button').simulate('click');
  expect(variables).toEqual({ a: 20, b: 40, c: 114 });

  const feedback = wrapper.update().find('div#feedback').at(0).props().dangerouslySetInnerHTML.__html.trim();
  expect(feedback).toEqual('<p>Good job</p>');
  expect(nextSceneId).toEqual('Not updated yet');
});

it('should replace the choose button with a next button when there is no feedback/outcome defined', () => {
  const sceneConfig = {
    config: {
      title: 'Some Scene',
      next: 'first'
    },
    description: 'This scene is for testing',
    choices: [
      {
        choice: 'first',
        variables: {
          a: '+10',
          b: '-10',
          c: 'round(a*b/7)'
        }
      }
    ]
  };
  const variables = {
    'a': 10,
    'b': 50,
    'c': 90
  };
  const options = {
    uuid: 'Some uuid'
  };
  let nextSceneId = 'Not updated yet';
  const wrapper = shallow(<Scene config={sceneConfig} variables={variables} onNavigate={(sceneId => nextSceneId = sceneId)} options={options} />);
  let store = {};
  window.localStorage = {
    setItem: (key, value) => { store[key] = value + '' },
    getItem: key => store[key]
  };

  wrapper.find('input#choice-0').simulate('change', {target: { value: '0' } });
  const button = wrapper.find('button');
  expect(button.text()).toEqual('Next');

  button.simulate('click');
  expect(variables).toEqual({ a: 20, b: 40, c: 114 });
  expect(nextSceneId).toEqual('first');
});

it('should save selected choices to local storage', () => {
  const sceneConfig = {
    config: {
      title: 'Some scene',
      next: 'first'
    },
    description: 'This scene is for testing',
    choices: [
      {
        choice: 'first',
        variables: {
          a: '+10',
          b: '-10',
          c: 'round(a*b/7)'
        }
      }
    ]
  };
  const options = {
    uuid: 'Some uuid'
  };
  const activeSceneId = 'Some scene';
  const variables = {
    'a': 10,
    'b': 50,
    'c': 90
  };

  let nextSceneId = 'Not updated yet';
  const wrapper = shallow(<Scene config={sceneConfig} variables={variables} onNavigate={(sceneId => nextSceneId = sceneId)} options={options} activeSceneId={activeSceneId} />);
  let store = {};
  window.localStorage = {
    setItem: (key, value) => { store[key] = value + '' },
    getItem: key => store[key],
    removeItem: () => { store = {} }
  };
  wrapper.find('input#choice-0').simulate('change', {target: { value: 0 } });
  expect(store).toEqual({'dilemma[Some uuid]': '{"Some scene":0}'});
});
