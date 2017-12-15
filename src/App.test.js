import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import App from './App';
import Scene from './Scene';


describe('render', () => {
  it('renders the initial scene with the proper variables', () => {
    const initialScene = { config: { title: 'initial scene' } };
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
});
  
describe('navigate', () => {
  it('navigates when the scene requests it', () => {
    const initialScene = { config: { title: 'Initial Scene'} };
    const scene2 = { config: {title: 'Scene #2' } };
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
});

describe('completed', () => {
  it('responds to the parent when embedded', () => {
    const initialScene = { config: { title: 'initial scene' } };
    const variables = {};
    
    const config = {
      initialScene: 'initialScene',
      variables,
      scenes: { initialScene }
    };
    const wrapper = shallow(<App config={config} options={{ isEmbedded: true }} />);
    const scene = wrapper.find(Scene).at(0).props();

    const spy = sinon.spy();
    window.parent.postMessage = spy;
    scene.onCompleted();

    expect(spy.called).toBe(true);
  });
});
