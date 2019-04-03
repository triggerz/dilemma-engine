import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import App from './App';
import Scene from './Scene';

describe('render', () => {
  it('renders the initial scene with the proper variables', () => {
    let store = {};
    window.localStorage = {
      setItem: (key, value) => { store[key] = value + '' },
      getItem: key => store[key],
      removeItem: () => { store = {} }
    };
    const initialScene = { config: { title: 'initial scene' } };
    const variables = {};

    const config = {
      initialScene: 'initialScene',
      variables,
      scenes: { initialScene },
      reviewFeedback: false
    };
    const wrapper = shallow(<App config={config} options={{ isEmbedded: true, uuid: '42' }} />);
    expect(wrapper.find(Scene)).toHaveLength(1);
    const scene = wrapper.find(Scene).at(0).props();
    expect(scene.config).toBe(initialScene);
    expect(scene.variables).toBe(variables);
  });
});

describe('navigate', () => {
  it('navigates when the scene requests it', () => {
    let store = {};
    window.localStorage = {
      setItem: (key, value) => { store[key] = value + '' },
      getItem: key => store[key],
      removeItem: () => { store = {} }
    };
    const initialScene = { config: { title: 'Initial Scene', next: 'scene2' } };
    const scene2 = { config: { title: 'Scene #2' } };
    const variables = {};

    const config = {
      initialScene: 'initialScene',
      variables,
      scenes: { initialScene, scene2 },
      reviewFeedback: false
    };
    const wrapper = shallow(<App config={config} options={{ isEmbedded: true, uuid: '42' }} />);
    const scene = wrapper.find(Scene).at(0).props();
    scene.onNavigate('scene2');

    const updatedScene = wrapper.update().find(Scene).at(0).props();
    expect(updatedScene.config).toBe(scene2);
  });
});

describe('completed', () => {
  it('responds to the parent when embedded', () => {
    let store = {};
    window.localStorage = {
      setItem: (key, value) => { store[key] = value + '' },
      getItem: key => store[key],
      removeItem: () => { store = {} }
    };
    const initialScene = { config: { title: 'initial scene' } };
    const variables = {
      a: { initialValue: 15, visible: true, export: true, score: 17 },
      b: { initialValue: 0, visible: false, export: 'per-page', scores: [10, 20] },
      c: { initialValue: 15, visible: true, export: false, score: 171 },
    };

    const config = {
      initialScene: 'initialScene',
      variables,
      maxValue: 100,
      scenes: { initialScene },
      reviewFeedback: false
    };
    const wrapper = shallow(<App config={config} options={{ isEmbedded: true, uuid: '42' }} />);
    const scene = wrapper.find(Scene).at(0).props();

    const spy = sinon.spy();
    window.parent.postMessage = spy;
    scene.onCompleted();

    expect(spy.args).toHaveLength(1);
    expect(JSON.parse(spy.args[0][0])).toEqual({answers: {}, message: 'dilemma-submit', variables: [['a', 17/100], ['b', 10/100], ['b', 20/100]], uuid: '42'});
  });

  it('sends a POST request if there is a response url defined', () => {
    let store = {};
    window.localStorage = {
      setItem: (key, value) => { store[key] = value + '' },
      getItem: key => store[key],
      removeItem: () => { store = {} }
    };
    global.fetch.reset();

    const initialScene = { config: { title: 'initial scene' } };
    const variables = { a: { initialValue: 15, visible: true, export: true, score: 17 } };

    const config = {
      initialScene: 'initialScene',
      variables,
      maxValue: 200,
      scenes: { initialScene },
      reviewFeedback: false
    };
    const wrapper = shallow(<App config={config} options={{ isEmbedded: false, uuid: '42', responseUrl: 'some-server' }} />);
    const scene = wrapper.find(Scene).at(0).props();

    scene.onCompleted();

    expect(global.fetch.args).toHaveLength(1);
    expect(global.fetch.args[0][0]).toEqual('some-server');
    expect(global.fetch.args[0][1].body.get('uuid')).toBe('42');
    expect(global.fetch.args[0][1].body.get('variables')).toBe(`[["a",${17/200}]]`);
  })
});
