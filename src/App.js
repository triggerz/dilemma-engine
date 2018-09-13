import React, { Component } from 'react';
import * as R from 'ramda';
import Scene from './Scene';
import localStorage from './localStorage';
import Progress from './Progress';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSceneId: localStorage.getInitialScene(props.config, props.options.uuid),
      currentSceneIndex: 1,
      variables: props.config.variables,
      exports: props.config.exports,
      visible: props.config.visible,
    };
  }

  componentWillMount() {
    if (window.location.hostname !== 'localhost') {
      window.onbeforeunload = () => true; // see: https://stackoverflow.com/questions/1119289/how-to-show-the-are-you-sure-you-want-to-navigate-away-from-this-page-when-ch
    }
  }

  onNavigate(sceneId) {
    this.setState({ activeSceneId: sceneId, currentSceneIndex: this.state.currentSceneIndex + 1 });
  }

  async onCompleted() {
    console.log(`## Dilemma engine: onCompleted`);
    window.onbeforeunload = null;

    const returnVariables = this.state.exports ? R.pickBy(function (value, key) {
      return R.contains(key, R.keys(this.state.exports));
    }.bind(this), this.state.variables)
    : this.state.variables;

    const normalizedReturnVariables = R.map(value => value / (this.props.config.maxValue), returnVariables);
    const uuid = this.props.options.uuid;
    const answers = localStorage.getAllAnswersFromLocalStorage(uuid);
    const readOnly = this.props.options.previousAnswers;
    window.localStorage.removeItem(`dilemma[${this.props.options.uuid}]`);
    if (this.props.options.isEmbedded) {
      console.log(`## Dilemma engine: posting message to parent`);
      const message = JSON.stringify({
        message: readOnly ? 'dilemma-readOnly' : 'dilemma-submit',
        uuid,
        variables: normalizedReturnVariables,
        answers
      });
      window.parent.postMessage(message, '*');
    } else if (this.props.options.responseUrl) {
      if (!readOnly) {
        console.log(`## Dilemma engine: sending response to ${this.props.options.responseUrl}`);
        const fd = new FormData();
        fd.append('uuid', uuid);
        fd.append('variables', JSON.stringify(normalizedReturnVariables));
        fd.append('answers', JSON.stringify(answers));
        try {
          await fetch(`${this.props.options.responseUrl}`, {
            method: 'POST',
            mode: 'no-cors',
            body: fd
          });
        } catch (e) {}
      }

      window.close();
    } else {
      console.log('## Dilemma engine: no complete-action specified. Results are: ', normalizedReturnVariables);
    }
  }

  render() {
    const activeSceneId = this.state.activeSceneId;
    const activeSceneConfig = this.props.config.scenes[activeSceneId];
    const feedbackFor = R.path(['config', 'feedbackfor'], activeSceneConfig);
    const sceneTitle = (feedbackFor ? this.props.config.scenes[feedbackFor] : activeSceneConfig).config.title;
    const variables = this.state.variables;
    const options = this.props.options;
    const firstScene = R.filter(key => key !== 'intro' && key !== 'outro', R.keys(this.props.config.scenes))[0]; // scene for first question
    return (
      <div className="main-container">
        <div className="main-container-buffer">
          <header>
            <h1>{sceneTitle}</h1>
            <Progress config={this.props.config} activeSceneId={activeSceneId} />
          </header>
          <Scene
            scenes={this.props.config.scenes}
            visible={this.state.visible}
            config={activeSceneConfig}
            variables={variables}
            onNavigate={this.onNavigate.bind(this)}
            onCompleted={this.onCompleted.bind(this)}
            options={options}
            activeSceneId={activeSceneId}
            firstScene={firstScene} />
        </div>
      </div>
    );
  }
}

export default App;
