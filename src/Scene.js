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
      selectedChoice: null,
      clickedComplete: false,
      showingFeedback: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const selectedChoice = this.getAnswerFromLocalStorage();
    if (nextProps.config !== this.props.config && !this.state.showingFeedback) {  // If we're changing scene, reset choice selection
      this.setState({
        mustChoose: nextProps.config.choices.length > 0,
        selectedChoice
      })
    }
  }

  onSelectChoice(changeEvent) {
    const selectedChoice = changeEvent.target.value;
    this.saveToLocalStorage(selectedChoice);
    this.setState({
      selectedChoice
    });
  }

  updateScores() {
    const choice = this.props.config.choices[this.state.selectedChoice];
    const varsToProcess = Object.keys(choice.variables);

    varsToProcess.forEach(v => {
      let expression = choice.variables[v];
      if (expression.match(/^(\+|-)\d*$/)) { // If the expression is simply +3 etc., add it to the previous value.
        expression = `${v} + ${expression}`;
      }
      this.props.variables[v] = math.eval(expression.toLowerCase(), this.props.variables);
    });
  }

  onChoose() {
    this.updateScores();
    this.setState({
      mustChoose: false
    });
    this.props.reviewFeedback && this.navigate();
  }

  navigate() {
    const hasFeedback = R.any(choice => choice.feedback || choice.outcome, this.props.config.choices);
    if (this.state.mustChoose && !hasFeedback && !this.state.showingFeedback) {
      // No feedback, so we need to update the scores here instead.
      this.updateScores();
    }
    let nextSceneId = this.props.config.config.next;
    if (nextSceneId) {
      this.props.onNavigate(nextSceneId);
    } else {
      if (this.props.reviewFeedback && !this.state.showingFeedback) {
        this.setState({
          showingFeedback: true
        });
        this.props.onNavigate(this.props.firstScene);
      } else {
        window.localStorage.removeItem(`dilemma[${this.props.options.uuid}]`);
        this.setState({clickedComplete: true});
        this.props.onCompleted();
      }
      if (this.state.showingFeedback) {
        window.localStorage.removeItem(`dilemma[${this.props.options.uuid}]`);
        this.setState({
          showingFeedback: false
        });
      }
    }
  }

  getAllAnswersFromLocalStorage() {
    const key = `dilemma[${this.props.options.uuid}]`;
    const savedString = window.localStorage.getItem(key);
    return (savedString && JSON.parse(savedString)) || {};
  }

  saveToLocalStorage(selectedChoice) {
    const savedAnswers = this.getAllAnswersFromLocalStorage();
    savedAnswers[this.props.activeSceneId] = selectedChoice;
    window.localStorage.setItem(`dilemma[${this.props.options.uuid}]`, JSON.stringify(savedAnswers));
  }

  getAnswerFromLocalStorage() {
    const savedAnswers = this.getAllAnswersFromLocalStorage();
    return savedAnswers[this.props.config.config.next];
  }

  renderFeedback(choiceValue) {
    const choice = this.props.config.choices[choiceValue];
    const sections = [];
    if (choice) {
      if (choice.choice) {
        sections.push({
          id: 'choice-text',
          title: 'Your response',
          innerHtml: md(choice.choice)
        });
      }

      if (choice.feedback) {
        sections.push({
          id: 'feedback',
          title: 'Feedback',
          innerHtml: md(choice.feedback)
        });
      }

      if (choice.outcome) {
        sections.push({
          id: 'outcome',
          title: 'Outcome',
          innerHtml: md(choice.outcome)
        });
      }

      return (
        <div>
          {sections.map(s => (
            <div key={s.id}>
              <h1>{s.title}</h1>
              <div id={s.id} dangerouslySetInnerHTML={{ __html: s.innerHtml }} />
            </div>))}
        </div>
      );
    }
  }

  render () {
    const combinedText = this.props.config.description;
    const description = md(combinedText);
    const video = this.props.config.config.video && normalizeIfYoutubeLink(this.props.config.config.video);
    const image = this.props.config.config.image;
    const videoPanel = (
     <div className="card video">
       <div className="container">
         <iframe title="embedded video" src={video} frameBorder="0" gesture="media" allow="encrypted-media" allowFullScreen />
       </div>
     </div>
    );
    const imagePanel = (
     <div className="card image">
       <img src={image} alt="" />
     </div>
    );

    const varNames = this.props.visible
      ? R.filter(v => (this.props.visible[v] && this.props.visible[v].toLowerCase() === 'true'), R.keys(this.props.variables))
      : R.keys(this.props.variables);

    const totalVarNameIndex = R.indexOf('total', varNames);
    const sortedVarNames = (totalVarNameIndex !== -1) ? R.prepend(varNames[totalVarNameIndex], R.remove(totalVarNameIndex, 1, varNames)) : varNames
    const gauges = sortedVarNames.map(varName => {
      const value = this.props.variables[varName];
      return (
        <div className={"gauge-container " + varName} key={varName}>
          <Gauge
            key={varName}
            value={value}
            max={this.props.config.maxValue}
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
    if (this.state.mustChoose && !this.state.showingFeedback) {
      const choices = this.props.config.choices.map((choice, i) => {
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
        choicePanel = this.renderFeedback(this.state.selectedChoice);
      }
      if (this.state.showingFeedback) {
        const savedAnswers = this.getAllAnswersFromLocalStorage();
        choicePanel = this.renderFeedback(savedAnswers[this.props.activeSceneId]);
      }
    }

    const hasFeedback = R.any(choice => choice.feedback || choice.outcome, this.props.config.choices);
    let navigationButton;
    if (this.state.mustChoose && hasFeedback && !this.state.showingFeedback) {
      navigationButton = (
        <button className="next-button" disabled={!this.state.selectedChoice} onClick={this.onChoose.bind(this)}>Choose</button>
      );
    } else {
      if (this.props.config.config.next) {
        const disabled = !!(this.state.mustChoose && !this.state.selectedChoice && !this.state.showingFeedback);
        navigationButton = (
          <button className="next-button" disabled={disabled} onClick={this.navigate.bind(this)}>Next</button>
        );
      } else {
        navigationButton = (
          <button className="next-button" disabled={this.state.clickedComplete} onClick={this.navigate.bind(this)}>Complete</button>
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
          {gaugePanel && <div className="card">
            {gaugePanel}
          </div>}
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
