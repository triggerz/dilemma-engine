import React, { Component } from 'react';
import md from 'marked';
import Gauge from 'react-svg-gauge';
import math from 'mathjs';
import * as R from 'ramda';
import normalizeIfYoutubeLink from './youtube';

class Scene extends Component {
  constructor (props) {
    super(props);
    this.state = {
      mustChoose: props.config.choices.length > 0,
      selectedChoice: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.config !== this.props.config) {  // If we're changing scene, reset choice selection
      this.setState({
        mustChoose: nextProps.config.choices.length > 0,
        selectedChoice: null
      })
    }
  }

  navigate() {
    let nextSceneId = this.props.config.config.next;
    if (nextSceneId) {
      this.props.onNavigate(nextSceneId);
    } else {
      this.props.onCompleted();
    }
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
    const video = this.props.config.config.video && normalizeIfYoutubeLink(this.props.config.config.video);
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
       <img src={image} alt=""></img>
     </div>
    );
    const varNames = Object.keys(this.props.variables);
    var totalVarNameIndex = R.indexOf('total', varNames);
    var sortedVarNames = (totalVarNameIndex !== -1) ? R.prepend(varNames[totalVarNameIndex], R.remove(totalVarNameIndex, 1, varNames)) : varNames
    const gauges = sortedVarNames.map(varName => {
      const value = this.props.variables[varName];
      return (
        <div className={"gauge-container " + varName} key={varName}>
          <Gauge
            key={varName}
            value={value}
            max={200}
            width={90}
            height={64}
            label={varName}
            minMaxLabelStyle={{display: 'none'}}
            topLabelStyle={{display: 'none'}}
            valueLabelStyle={{color: '#707070', fontSize: '22px'}}
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
        const choiceText = md(choice.choice);
        return (
          <div key={choiceKey}>
            <input type="radio" name="choice" id={choiceKey} value={i} onChange={this.onSelectChoice.bind(this)} />
            <label htmlFor={choiceKey} dangerouslySetInnerHTML={{ __html: choiceText }} />
          </div>
        );
      });
      choicePanel = choices.length ? <form className="choices-panel">{choices}</form> : null;
    } else {
      if(this.state.selectedChoice) {
        const choice = this.props.config.choices[this.state.selectedChoice];
        const choiceText = md(choice.choice);
        const feedback = md(choice.feedback);
        const outcome = md(choice.outcome);
        choicePanel = (
            <div>
              <h1>Your response</h1>
              <div id='choice-text' dangerouslySetInnerHTML={{ __html: choiceText }} />
              <h1>Feedback</h1>
              <div id='feedback' dangerouslySetInnerHTML={{ __html: feedback }} />
              <h1>Outcome</h1>
              <div id='outcome' dangerouslySetInnerHTML={{ __html: outcome }} />
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
      if (this.props.config.config.next) {
        navigationButton = (
          <button className="next-button" onClick={this.navigate.bind(this)}>Next</button>
        );
      } else {
        navigationButton = (
          <button className="next-button" onClick={this.navigate.bind(this)}>Complete</button>
        );
      }
    }

    return (
      <div className="game">
        <section className="description block half-width-block">
          {video && videoPanel}
          {image && imagePanel}
          <div className="card">
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
