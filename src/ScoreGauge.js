import React, { Component } from 'react';
import Gauge from 'react-svg-gauge';

export default function ScoreGauge ({ varName, value, maxValue }) {
  return (
    <div className={"gauge-container " + varName} key={varName}>
      <Gauge
        key={varName}
        value={value}
        max={maxValue}
        width={90}
        height={64}
        label={varName}
        minMaxLabelStyle={{ display: 'none' }}
        topLabelStyle={{ display: 'none' }}
        valueLabelStyle={{ color: '#707070', fontSize: '22px' }}
      />
      <span>{varName}</span>
    </div>
  )
}
