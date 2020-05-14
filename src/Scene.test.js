import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Scene from './Scene';
import ScoreGauge from './ScoreGauge';
import Feedback from './Feedback';

describe('<Scene />', () => {
  let wrapper;
  beforeEach(() => {
    const sceneConfig = {
      config: {
        title: 'Some scene',
        next: 'first',
      },
      description: 'This scene is for testing',
      maxValue: 100,
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
      'a-x': { initialValue: 10, score: 10, export: true, visible: true },
      'b': { initialValue: 50, score: 50, export: true, visible: true },
      'c': { initialValue: 90, score: 90, export: true, visible: true }
    };

    let nextSceneId = 'Not updated yet';
    wrapper = shallow(<Scene config={sceneConfig} variables={variables} onNavigate={(sceneId => nextSceneId = sceneId)} options={options} activeSceneId={activeSceneId} />);
  });

  it('renders the initial scene with the proper variables', () => {
    expect(wrapper.find(ScoreGauge)).toHaveLength(3);
    const gauge1 = wrapper.find(ScoreGauge).at(0).props();
    expect(gauge1).toMatchObject({ varName: 'a-x', value: 10, maxValue: 100 });
    const gauge2 = wrapper.find(ScoreGauge).at(1).props();
    expect(gauge2).toMatchObject({ varName: 'b', value: 50, maxValue: 100 });
    const gauge3 = wrapper.find(ScoreGauge).at(2).props();
    expect(gauge3).toMatchObject({ varName: 'c', value: 90, maxValue: 100 });
  });

  it('should save selected choices to local storage', () => {
    let store = {};
    window.localStorage = {
      setItem: (key, value) => { store[key] = value + '' },
      getItem: key => store[key],
      removeItem: () => { store = {} }
    };
    // Note: there's a new way to mock localStorage apparently
    Storage.prototype.setItem = (key, value) => { store[key] = value + '' };
    Storage.prototype.getItem = key => store[key];
    Storage.prototype.removeItem = () => { store = {} };
    window.scrollTo = () => {};
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
      'a-x': { initialValue: 10, score: 10, export: true, visible: true },
      'b': { initialValue: 50, score: 50, export: true, visible: true },
      'c': { initialValue: 90, score: 90, export: true, visible: true }
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
    expect(variables).toEqual({
      'a-x': { initialValue: 10, score: 20, export: true, visible: true },
      'b': { initialValue: 50, score: 40, export: true, visible: true },
      'c': { initialValue: 90, score: 114, export: true, visible: true }
    });

    const feedback = wrapper.update().find(Feedback).at(0).props();
    expect(feedback.choice.feedback).toEqual('Good job');
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
      'a': { initialValue: 10, score: 10, export: true, visible: true },
      'b': { initialValue: 50, score: 50, export: true, visible: true },
      'c': { initialValue: 90, score: 90, export: true, visible: true }
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
    expect(variables).toEqual({
      'a': { initialValue: 10, score: 20, export: true, visible: true },
      'b': { initialValue: 50, score: 40, export: true, visible: true },
      'c': { initialValue: 90, score: 114, export: true, visible: true }
    });
    expect(nextSceneId).toEqual('first');
  });
});

describe('per-page scores', () => {
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
            a: '79',
          }
        }
      ]
    };
    variables = {
      a: { initialValue: 0, scores: [10, 20], export: 'per-page', visible: false },
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

  it('should update the scores array for per-page exports', () => {
    wrapper.find('input#choice-0').simulate('change', { target: { value: '0' } });
    wrapper.find('button').simulate('click');
    expect(variables).toEqual({
      a: { initialValue: 0, scores: [10, 20, 79], export: 'per-page', visible: false },
    });

    const feedback = wrapper.update().find(Feedback).at(0).props();
    expect(feedback.choice.feedback).toEqual('Good job');
    expect(nextSceneId).toEqual('first');
  });
});
