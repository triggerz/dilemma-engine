import React, { Component } from 'react';
import * as R from 'ramda';
import Scene from './Scene';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSceneId: props.config.initialScene,
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

    const normalizedReturnVariables = R.map(value => value / (this.props.config.maxValue), returnVariables); // 200 is also referenced as the max value in the gauge component. Should be consolidated at some point

    if (this.props.options.isEmbedded) {
      console.log(`## Dilemma engine: posting message to parent`);
      const message = JSON.stringify({
        message: 'dilemma-submit',
        uuid: this.props.options.uuid,
        variables: normalizedReturnVariables
      });
      window.parent.postMessage(message, '*');
    } else if (this.props.options.responseUrl) {
      console.log(`## Dilemma engine: sending response to ${this.props.options.responseUrl}`);
      const fd = new FormData();
      fd.append('uuid', this.props.options.uuid);
      fd.append('variables', JSON.stringify(normalizedReturnVariables));
      try {
        await fetch(`${this.props.options.responseUrl}`, {
          method: 'POST',
          mode: 'no-cors',
          body: fd
        });
      } catch (e) {}
        
      window.close();
    } else {
      console.log('## Dilemma engine: no complete-action specified. Results are: ', normalizedReturnVariables);
    }
  }

  render() {
    const activeSceneConfig = this.props.config.scenes[this.state.activeSceneId];
    const variables = this.state.variables;
    const sceneCount = R.values(this.props.config.scenes).length;
    const progress = `${this.state.currentSceneIndex}/${sceneCount}`;
    const options = this.props.options;
    return (
      <div className="main-container">
        <div className="main-container-buffer">
          <header>
            <h1>{activeSceneConfig.config.title}</h1>
            <span className="progress">{progress}</span>
          </header>
          <Scene visible={this.state.visible} config={activeSceneConfig} variables={variables} onNavigate={this.onNavigate.bind(this)} onCompleted={this.onCompleted.bind(this)} options={options} activeSceneId={this.state.activeSceneId} />
        </div>
      </div>
    );
  }
}

export default App;
