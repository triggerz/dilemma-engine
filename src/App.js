import React, { Component } from 'react';
import * as R from 'ramda';
import Scene from './Scene';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSceneId: props.config.initialScene,
      variables: props.config.variables,
      exports: props.config.exports,
      visible: props.config.visible,
      values: props.config.values
    };
  }

  componentWillMount() {
    if (window.location.hostname !== 'localhost') {
      window.onbeforeunload = () => true; // see: https://stackoverflow.com/questions/1119289/how-to-show-the-are-you-sure-you-want-to-navigate-away-from-this-page-when-ch
    }
  }

  onNavigate(sceneId) {
    this.setState({ activeSceneId: sceneId });
  }

  async onCompleted() {
    window.onbeforeunload = null;

    console.log(`## Dilemma engine: onCompleted`);
    console.log(this.props);
    const returnVariables = this.state.exports ? R.pickBy(function (value, key) {
      return R.contains(key, R.keys(this.state.exports));
    }.bind(this), this.state.variables)
    : this.state.variables;
    const normalizedReturnVariables = R.map(value => value / (R.path(['values', 'max'], this.state) || 200), returnVariables) // 200 is also referenced as the max value in the gauge component. Should be consolidated at some point
    if (this.props.options.isEmbedded) {
      console.log(`## Dilemma engine: posting message to parent`);
      const message = JSON.stringify({
        message: 'dilemma-submit',
        uuid: this.props.options.uuid,
        variables: normalizedReturnVariables
      });
      window.parent.postMessage(message, '*');
    } else if (this.props.config.responseUrl) {
      console.log(`## Dilemma engine: sending response to ${this.props.config.responseUrl}`);
      const fd = new FormData();
      fd.append('uuid', this.props.options.uuid);
      fd.append('variables', JSON.stringify(normalizedReturnVariables));
      try {
        await fetch(`${this.props.config.responseUrl}`, {
          method: 'POST',
          mode: 'no-cors',
          body: fd
        });
      } catch (e) {}
        
      window.close();
    }
  }

  render() {
    const activeSceneConfig = this.props.config.scenes[this.state.activeSceneId];
    const variables = this.state.variables;
    return (
      <div className="main-container">
        <div className="main-container-buffer">
          <header>
            <h1>{activeSceneConfig.config.title}</h1>
          </header>
          <Scene values={this.state.values} visible={this.state.visible} config={activeSceneConfig} variables={variables} onNavigate={this.onNavigate.bind(this)} onCompleted={this.onCompleted.bind(this)} />
        </div>
      </div>
    );
  }
}

export default App;
