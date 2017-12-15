import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import App from './App';
import Scene from './Scene';

it('renders the initial scene with the proper variables', () => {
  const initialScene = {};
  const variables = {};

  const config = {
    initialScene: 'initialScene',
    variables,
    scenes: { initialScene }
  };
  const wrapper = shallow(<App config={config} />);

  expect(wrapper.find(Scene)).toHaveLength(1);
  const scene = wrapper.find(Scene).at(0).props();
  expect(scene.config).toBe(initialScene);
  expect(scene.variables).toBe(variables);
});

it('navigates when the scene requests it', () => {
  const initialScene = { title: 'Initial Scene' };
  const scene2 = { title: 'Scene #2'};
  const variables = {};

  const config = {
    initialScene: 'initialScene',
    variables,
    scenes: { initialScene, scene2 }
  };
  const wrapper = shallow(<App config={config} />);
  const scene = wrapper.find(Scene).at(0).props();
  scene.onNavigate('scene2');

  const updatedScene = wrapper.update().find(Scene).at(0).props();
  expect(updatedScene.config).toBe(scene2);
});
