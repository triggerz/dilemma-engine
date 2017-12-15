import React, { Component } from 'react';
import Scene from './Scene';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSceneId: props.config.initialScene,
      variables: props.config.variables
    };
  }

  onNavigate(sceneId) {
    this.setState({ activeSceneId: sceneId });
  }

  onCompleted() {
    console.log(`## Dilemma engine: onCompleted`);
    if (this.props.options.isEmbedded) {
      console.log(`## Dilemma engine: posting message to parent`);
      const message = JSON.stringify({
        message: 'dilemma-submit',
        uuid: this.props.options.uuid,
        variables: this.state.variables
      });
      window.parent.postMessage(message, '*');
    } else if (this.props.config.responseServer) {
      console.log(`## Dilemma engine: sending response to ${this.props.config.responseServer}`);
      const fd = new FormData();
      fd.append('uuid', this.props.options.uuid);
      fd.append('variables', JSON.stringify(this.state.variables));
      fetch(`${this.props.config.responseServer}`, {
        method: 'POST',
        body: fd
      });
    }
  }

  render() {
    const activeSceneConfig = this.props.config.scenes[this.state.activeSceneId];
    const variables = this.state.variables;
    if (window.location.hostname !== 'localhost') {
      window.onbeforeunload = () => true; // see: https://stackoverflow.com/questions/1119289/how-to-show-the-are-you-sure-you-want-to-navigate-away-from-this-page-when-ch
    }
    return (
      <div className="main-container">
        <div className="main-container-buffer">
          <header>
            <h1>{activeSceneConfig.config.title}</h1>
          </header>
          <Scene config={activeSceneConfig} variables={variables} onNavigate={this.onNavigate.bind(this)} onCompleted={this.onCompleted.bind(this)} />
        </div>
      </div>
    );
  }
}

export default App;
