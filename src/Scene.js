import React, { Component } from 'react';
import md from 'marked';
import Gauge from 'react-svg-gauge';
import math from 'mathjs';
var R = require('ramda');

class Scene extends Component {
  constructor (props) {
    super(props);
    this.state = {
      mustChoose: props.config.choices.length > 0,
      selectedChoice: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.config != this.props.config) {  // If we're changing scene, reset choice selection
      this.setState({
        mustChoose: nextProps.config.choices.length > 0,
        selectedChoice: null
      })
    }
  }

  navigate() {
    let nextSceneId = this.props.config.config.next;
    if (this.props.config.choices.length) {
      const choice = this.props.config.choices[this.state.selectedChoice];
      nextSceneId = choice.next || this.props.config.config.next;
    }
    this.props.onNavigate(nextSceneId);
  }

  onSelectChoice(changeEvent) {
    this.setState({
      selectedChoice: changeEvent.target.value
    });
  }

  onChoose() {
    const choice = this.props.config.choices[this.state.selectedChoice];
    const varsToProcess = Object.keys(choice.variables);

    varsToProcess.forEach(v => {
      let expression = choice.variables[v];
      if (expression.match(/^(\+|-)\d*$/)) { // If the expression is simply +3 etc., add it to the previous value.
        expression = `${v} + ${expression}`;
      }
      this.props.variables[v] = math.eval(expression.toLowerCase(), this.props.variables);
    });

    this.setState({
      mustChoose: false
    })

  }

  render () {
    const title = this.props.config.config.title;
    const combinedText = this.props.config.description;
    const description = md(combinedText);
    const video = this.props.config.config.video;
    const image = this.props.config.config.image;
    const videoPanel = (
     <div className="card video">
       <div className="container">
         <iframe title="embedded video" src={video} frameBorder="0" gesture="media" allow="encrypted-media" allowFullScreen></iframe>
       </div>
     </div>
    );
    const imagePanel = (
     <div className="card image">
       <img src={image}></img>
     </div>
    );
    const varNames = Object.keys(this.props.variables);
    var totalVarNameIndex = R.indexOf('total', varNames);
    var sortedVarNames = totalVarNameIndex ? R.prepend(varNames[totalVarNameIndex], R.remove(totalVarNameIndex, 1, varNames)) : varNames
    const gauges = sortedVarNames.map(varName => {
      const value = this.props.variables[varName];
      return (
        <div className={"gauge-container " + varName} key={varName}>
          <Gauge
            key={varName}
            value={value}
            max={200}
            width={100}
            height={64}
            label={varName}
            minMaxLabelStyle={{display: 'none'}}
            topLabelStyle={{display: 'none'}}
            valueLabelStyle={{color: '#707070', fontSize: '24px'}}
          />
        <span>{varName}</span>
        </div>
      );
    });
    const gaugePanel = gauges.length ? <div className="gauges panel">{gauges}</div> : null;

    let choicePanel;
    if (this.state.mustChoose) {
      const choices = this.props.config.choices.map((choice, i) => {
        const choiceKey = `choice-${i}`;
        return (
          <div key={choiceKey}>
            <input type="radio" name="choice" id={choiceKey} value={i} onChange={this.onSelectChoice.bind(this)} />
            <label htmlFor={choiceKey}>{choice.choice}</label>
          </div>
        );
      });
      choicePanel = choices.length ? <form className="choices-panel">{choices}</form> : null;
    } else {
      if(this.state.selectedChoice) {
        const choice = this.props.config.choices[this.state.selectedChoice];
        const feedback = md(choice.feedback);
        choicePanel = (
          <div className='choices-panel'>
            <div>
              <input type="radio" name="choice" name="selected-choice" disabled checked />
              <label htmlFor="selected-choice">{choice.choice}</label>
              <div id='feedback' dangerouslySetInnerHTML={{ __html: feedback }}></div>
            </div>
          </div>
        );
      }
    }

    let navigationButton;
    if (this.state.mustChoose) {
      navigationButton = (
        <button className="next-button" disabled={ !this.state.selectedChoice } onClick={this.onChoose.bind(this)}>Choose</button>
      );
    } else {
      navigationButton = (
        <button className="next-button" onClick={this.navigate.bind(this)}>Next</button>
      );
    }

    return (
      <div className="game">
        <section className="description block half-width-block">
          {video && videoPanel}
          {image && imagePanel}
          <div className="card">
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{__html: description}} />
          </div>
        </section>
        <section className="sidebar block half-width-block">
          <div className="card">
            {gaugePanel}
          </div>
          {choicePanel && <div className="card">
            {choicePanel}
          </div>}
        </section>
        {navigationButton}
      </div>
    );
  }
}

export default Scene;
