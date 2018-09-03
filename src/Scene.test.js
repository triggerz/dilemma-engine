import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Scene from './Scene';
import Gauge from 'react-svg-gauge';

describe(<Scene />, () => {
  let wrapper;
  beforeEach(() => {
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
            'a-x': '+10',
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
    wrapper = shallow(<Scene config={sceneConfig} variables={variables} onNavigate={(sceneId => nextSceneId = sceneId)} options={options} activeSceneId={activeSceneId} />);
  });

  it('renders the initial scene with the proper variables', () => {
    expect(wrapper.find(Gauge)).toHaveLength(3);
    const gauge1 = wrapper.find(Gauge).at(0).props();
    const gauge2 = wrapper.find(Gauge).at(1).props();
    const gauge3 = wrapper.find(Gauge).at(2).props();
//  expect(gauge1).toMatchObject({ value: 10, label: 'a', color: 'rgb(229, 26, 0)' });
//  expect(gauge2).toMatchObject({ value: 50, label: 'b', color: 'rgb(127, 128, 0)' });
//  expect(gauge3).toMatchObject({ value: 90, label: 'c', color: 'rgb(25, 230, 0)' });
  });

  it('should save selected choices to local storage', () => {
    let store = {};
    window.localStorage = {
      setItem: (key, value) => { store[key] = value + '' },
      getItem: key => store[key],
      removeItem: () => { store = {} }
    };
    wrapper.find('input#choice-0').simulate('change', {target: { value: 0 } });
    expect(store).toEqual({'dilemma[Some uuid]': '{"Some scene":0}'});
  });
});

describe('onChoose', () => {
  let wrapper, variables, nextSceneId, sceneConfig;
  const onCompleted = sinon.spy();
  beforeEach(() => {
    sceneConfig = {
      config: {
        title: 'Some Scene',
        next: 'first'
      },
      sceneId: '',
      description: 'This scene is for testing',
      choices: [
        {
          choice: 'first',
          feedback: 'Good job',
          outcome: 'Everybody is happy',
          variables: {
            'a-x': '+10',
            b: '-10',
            c: 'round(a-x*b/7)'
          }
        },
        {
          choice: 'second',
          variables: {
            'a-x': '+10',
            b: '-10',
            c: 'round(a*b/7)'
          }
        }
      ]
    };
    variables = {
      'a-x': 10,
      'b': 50,
      'c': 90
    };
    const options = {
      uuid: 'Some uuid'
    };
    const sceneArray = [
      {
        sceneId: 'scene #1',
        hasQuestion: true
      },
      {
        sceneId: 'scene #2',
        hasQuestion: false
      }
    ];
    nextSceneId = 'Not updated yet';
    const activeSceneId = sceneArray[0].sceneId;
    wrapper = shallow(
      <Scene config={sceneConfig}
             variables={variables}
             onNavigate={(sceneId => nextSceneId = sceneId)}
             options={options}
             sceneArray={sceneArray}
             onCompleted={onCompleted}
             activeSceneId={activeSceneId}
      />);
  });

  it('should adjust variables according to rules when choosing', () => {
    wrapper.find('input#choice-0').simulate('change', {target: { value: '0' } });
    wrapper.find('button').simulate('click');
    expect(variables).toEqual({ 'a-x': 20, b: 40, c: 114 });

    const feedback = wrapper.update().find('div#feedback').at(0).props().dangerouslySetInnerHTML.__html.trim();
    expect(feedback).toEqual('<p>Good job</p>');
    expect(nextSceneId).toEqual('first');
  });
});

describe('noFeedback', () => {
  it('should replace the choose button with a next button when there is no feedback/outcome defined', () => {
    const sceneConfig = {
      config: {
        title: 'Some Scene',
        next: 'first'
      },
      sceneId: '',
      description: 'This scene is for testing',
      choices: [
        {
          choice: 'second',
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
    const sceneArray = [
      {
        sceneId: 'scene #1',
        hasQuestion: true
      },
      {
        sceneId: 'scene #2',
        hasQuestion: false
      }
    ];
    let nextSceneId = 'Not updated yet';
    const activeSceneId = sceneArray[0].sceneId;
    const onCompleted = sinon.spy();
    const wrapper = shallow(
      <Scene config={sceneConfig}
             variables={variables}
             onNavigate={(sceneId => nextSceneId = sceneId)}
             options={options}
             sceneArray={sceneArray}
             onCompleted={onCompleted}
             activeSceneId={activeSceneId}
      />);
    wrapper.find('input#choice-0').simulate('change', {target: { value: '0' } });
    const button = wrapper.find('button');
    expect(button.text()).toEqual('Next');

    button.simulate('click');
    expect(variables).toEqual({ a: 20, b: 40, c: 114 });
    expect(nextSceneId).toEqual('first');
  });
});