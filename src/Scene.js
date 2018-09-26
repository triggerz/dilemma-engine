import React, { Component } from 'react';
import md from 'marked';
import math from 'mathjs';
import * as R from 'ramda';
import ScoreGauge from './ScoreGauge';
import normalizeIfYoutubeLink from './youtube';
import localStorage from './localStorage';

// Helper function from the Ramda cookbook:
//    mapKeys :: (String -> String) -> Object -> Object
const mapKeys = R.curry((fn, obj) =>
  R.fromPairs(R.map(R.adjust(fn, 0), R.toPairs(obj))));

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
    const choice = this.state.scene.choices[this.state.selectedChoice];
    if (choice.variables) {
      const varsToProcess = choice.variables && Object.keys(choice.variables);

      varsToProcess.forEach(v => {
        let expression = choice.variables[v];

        if (this.props.variables[v].export === 'per-page') {
          const value = Number(expression);
          this.props.variables[v].scores.push(value);
        } else {
          if (expression.match(/^(\+|-)\d*$/)) { // If the expression is simply +3 etc., add it to the previous value.
            expression = `${v} + ${expression}`;
          }

          // Map names with dashes to the equivalent with underscores.
          const normalizeName = name => name.replace('-', '_');

          const names = R.keys(this.props.variables);
          const normalizedExpression = R.reduce((expr, name) => expr.replace(name, normalizeName(name)), expression.toLowerCase(), names);
          const normalizedVariables = R.map(R.prop('score'), mapKeys(normalizeName, this.props.variables));

          this.props.variables[v].score = math.eval(normalizedExpression, normalizedVariables);
        }
      });
    }
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

  renderFeedback(choiceValue) {
    const choice = this.state.scene.choices[choiceValue];
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
    const combinedText = this.state.scene.description;
    const description = md(combinedText);
    const video = this.state.scene.config.video && normalizeIfYoutubeLink(this.state.scene.config.video);
    const image = this.state.scene.config.image;
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
        choicePanel = this.renderFeedback(this.state.selectedChoice);
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
