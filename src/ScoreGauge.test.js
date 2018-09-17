import React from 'react';
import { shallow } from 'enzyme';
import ScoreGauge from './ScoreGauge';
import Gauge from 'react-svg-gauge';

describe('render', () => {
  it('renders the ScoreGauge', () => {
    const wrapper = shallow(<ScoreGauge value="78" maxValue="200" varName="tester" />);
    expect(wrapper.find(Gauge).props()).toMatchObject({
      label: 'tester',
      max: '200',
      value: '78'
    });
  });
});

