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
    if (this.props.isEmbedded) {
      const message = JSON.stringify({
        message: 'dilemma-submit',
        uuid: this.props.options.uuid
      });
      window.parent.postMessage(message, '*');

    } else {
      const fd = new FormData();
      fd.append('uuid', this.props.options.uuid);
      fetch(`${this.props.config.responseServer}`, {
        method: 'POST',
        body: fd
      });
    }
  }

  render() {
    const activeSceneConfig = this.props.config.scenes[this.state.activeSceneId];
    const variables = this.state.variables;

    return (
      <div className="main-container">
        <div className="main-container-buffer">
          <header>
            <h1>{this.props.config.title}</h1>
          </header>
          <Scene config={activeSceneConfig} variables={variables} onNavigate={this.onNavigate.bind(this)} onCompleted={this.onCompleted.bind(this)} />
        </div>
      </div>
    );
  }
}

export default App;
