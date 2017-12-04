import React, { Component } from 'react';
import md from 'marked';
import Gauge from 'react-svg-gauge';
import parse from './mdconf';


const renderer = new md.Renderer();
renderer.image = function(href, title, text) {

  let out = '<img src="scenes/intro/' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

class Scene extends Component {
  render () {
    const title = Object.keys(this.props.config)[0];
    const combinedText = this.props.config[title]['(text)'].join('\n\n');
    const text = md(combinedText, {renderer});
    return (
      <div>
        <Gauge value={33} width={80} height={64} label="Leadership" minMaxLabelStyle={{display: 'none'}} />
        <Gauge value={75} width={80} height={64} label="Project management" minMaxLabelStyle={{display: 'none'}} />
        <Gauge value={12} width={80} height={64} label="Friday beers" minMaxLabelStyle={{display: 'none'}} />
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{__html: text}} />
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSceneId: props.config.initialScene
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
    const gameState = this.state.gameState;

    return (
      <div className="pure-g">
        <div className="pure-u-1-5"></div>
        <div className="pure-u-3-5">
          <header>
            <h1>{this.props.config.title}</h1>
          </header>
          <Scene config={activeSceneConfig} gameState={gameState} onNavigate={this.onNavigate.bind(this)} onCompleted={this.onCompleted.bind(this)} />
        </div>
        <div className="pure-u-1-5"></div>
      </div>
    );
  }
}

export default App;
