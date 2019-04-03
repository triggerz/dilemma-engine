import React, { Component } from 'react';
import md from 'marked';
import * as R from 'ramda';

import ScoreGauge from './ScoreGauge';
import helper from './helper';
import localStorage from './localStorage';
import VideoPanel from './VideoPanel';
import ImagePanel from './ImagePanel';
import Feedback from './Feedback';

class Scene extends Component {
  constructor (props) {
    super(props);
    this.state = {
      mustChoose: props.config.choices.length > 0,
      selectedChoice: null,
      clickedComplete: false,
      scene: props.config
    };
  }

  componentWillReceiveProps(nextProps) {
    const nextSceneConfig = nextProps.config;
    const feedbackFor = R.path(['config', 'feedbackfor'], nextSceneConfig);
    const nextSceneExpandedConfig = feedbackFor ? this.props.scenes[feedbackFor] : nextSceneConfig;
    const selectedChoice = localStorage.getAnswerFromLocalStorage(nextSceneExpandedConfig.sceneId, this.props.options.uuid);
    if (nextProps.config !== this.props.config) {  // If we're changing scene, reset choice selection
      this.setState({
        mustChoose: nextProps.config.choices.length > 0,
        selectedChoice,
        scene: nextSceneExpandedConfig
      })
    }
  }

  onSelectChoice(changeEvent) {
    const selectedChoice = changeEvent.target.value;
    localStorage.saveToLocalStorage(selectedChoice, this.props.activeSceneId, this.props.options.uuid);
    this.setState({
      selectedChoice
    });
  }

  updateScores() {
    helper.updateScores(this.props.variables, this.state.scene, this.state.selectedChoice);
  }

  onChoose() {
    this.updateScores();
    this.setState({ mustChoose: false });
    this.navigate();
  }

  navigate() {
    const hasFeedback = R.any(choice => choice.feedback || choice.outcome, this.state.scene.choices);
    if (this.state.mustChoose && !hasFeedback) {
      // No feedback, so we need to update the scores here instead.
      this.updateScores();
    }
    const nextSceneId = this.props.config.config.next;
    if (nextSceneId) {
      this.props.onNavigate(nextSceneId);
    } else {
      this.setState({clickedComplete: true});
      this.props.onCompleted();
    }
  }

  navigateBack() {
    const previousSceneId = R.indexOf(this.props.activeSceneId, R.keys(this.props.scenes)) - 1;
    const previousScene = R.keys(this.props.scenes)[previousSceneId];
    this.props.onNavigate(previousScene);
  }

  renderFeedback(choiceValue) {
    const choice = this.state.scene.choices[choiceValue];
    return choice && <Feedback choice={choice} />;
  }

  render () {
    const combinedText = this.state.scene.description;
    const description = md(combinedText);

    const varNames = R.filter(v => this.props.variables[v].visible, R.keys(this.props.variables));

    const totalVarNameIndex = R.indexOf('total', varNames);
    const sortedVarNames = (totalVarNameIndex !== -1) ? R.prepend(varNames[totalVarNameIndex], R.remove(totalVarNameIndex, 1, varNames)) : varNames
    const gauges = sortedVarNames.map(varName => {
      const value = this.props.variables[varName].score;
      return <ScoreGauge key={varName} varName={varName} value={value} maxValue={this.state.scene.maxValue} />;
    });
    const gaugePanel = gauges.length ? <div className="gauges panel">{gauges}</div> : null;

    let choicePanel;
    if (this.state.mustChoose) {
      const choices = this.state.scene.choices.map((choice, i) => {
        const choiceKey = `choice-${i}`;
        const choiceText = md(choice.choice);
        return (
          <div key={choiceKey}>
            <input type="radio" name="choice" id={choiceKey} value={i} checked={this.state.selectedChoice === `${i}`} onChange={this.onSelectChoice.bind(this)} />
            <label htmlFor={choiceKey} dangerouslySetInnerHTML={{ __html: choiceText }} />
          </div>
        );
      });
      choicePanel = choices.length ? <form className="choices-panel">{choices}</form> : null;
    } else {
      if(this.state.selectedChoice) {
        const choice = this.state.scene.choices[this.state.selectedChoice];
        choicePanel = choice && <Feedback choice={choice} />;
      }
    }

    const hasFeedback = R.any(choice => choice.feedback || choice.outcome, this.state.scene.choices);
    let navigationButton;
    if (this.state.mustChoose && hasFeedback) {
      navigationButton = (
        <button className="next-button" disabled={!this.state.selectedChoice} onClick={this.onChoose.bind(this)}>Next</button>
      );
    } else {
      if (this.state.scene.config.next) {
        const disabled = !!(this.state.mustChoose && !this.state.selectedChoice);
        navigationButton = (
          <button className="next-button" disabled={disabled} onClick={this.navigate.bind(this)}>Next</button>
        );
      } else {
        navigationButton = (
          <button className="next-button" disabled={this.state.clickedComplete} onClick={this.navigate.bind(this)}>Submit</button>
        );
      }
    }
    const showBackButton = (!this.state.mustChoose && this.state.selectedChoice) || !this.props.config.config.next || this.state.clickedComplete;
    const backButton = <button className="back-button" onClick={this.navigateBack.bind(this)}>Back</button>;
    return (
      <div className="game">
        <section className="description block half-width-block">
          {this.state.scene.config.video && <VideoPanel video={this.state.scene.config.video} />}
          {this.state.scene.config.image && <ImagePanel image={this.state.scene.config.image} />}
          <div className="card">
            <div dangerouslySetInnerHTML={{__html: description}} />
          </div>
        </section>
        <section className="sidebar block half-width-block">
          {gaugePanel && <div className="card">
            {gaugePanel}
          </div>}
          {choicePanel && <div className="card">
            {choicePanel}
          </div>}
        </section>
        {navigationButton}
        {this.props.showBackButton && showBackButton && backButton}
      </div>
    );
  }
}

export default Scene;
