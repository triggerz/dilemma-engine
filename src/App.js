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

class IntroPage extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      value: 75
     };
  }

  componentDidMount() {
    fetch('scenes/intro/index.md').then(r => r.text()).then(configMarkdown => {
      this.setState({
        loading: false,
        scene: parse(configMarkdown)
      });
    });
  }

  render () {
    if (this.state.loading) {
      return <div>Loading...</div>
    };

    const title = Object.keys(this.state.scene)[0];
    const combinedText = this.state.scene[title]['(text)'].join('\n\n');

    const text = md(combinedText, {renderer});

    let backgroundImage;
    if (this.state.scene.config.background) {
      backgroundImage = [
        <div key='a' style={{ position: 'absolute', width: '100%', height: '100%', background: `url(${this.state.scene.config.background})`, backgroundSize: 'cover', zIndex: -100, top: '0', left: '0'}} />,
        <div key='b' style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity: '0.9', zIndex: -50, top: '0', left: '0'}} />
      ];
    }

    return (
      <div>
        {backgroundImage}
        <Gauge value={33} width={80} height={64} label="Leadership" minMaxLabelStyle={{display: 'none'}} />
        <Gauge value={75} width={80} height={64} label="Project management" minMaxLabelStyle={{display: 'none'}} />
        <Gauge value={12} width={80} height={64} label="Friday beers" minMaxLabelStyle={{display: 'none'}} />
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{__html: text}} />
        <button className="pure-button pure-button-primary button-xlarge">Get started</button>
      </div>
    )
  }
}

class App extends Component {
  onCompleted() {
    const searchParams = new URLSearchParams(window.location.search);
    const uuid = searchParams.get('uuid');

    const isEmbedded = !!searchParams.get('embed');

    if (isEmbedded) {
      const message = JSON.stringify({
        message: 'dilemma-submit',
        uuid
      });
      window.parent.postMessage(message, '*');

    } else {
      const fd = new FormData();
      fd.append('uuid', uuid);
      fetch(`${this.props.config.responseServer}`, {
        method: 'POST',
        body: fd
//        headers: {
//          'Accept': 'application/json',
//          'Content-Type': 'application/json'
//        },
//        body: JSON.stringify({ uuid })
      });
    }
  }

  render() {
    const completedStyle = {
      margin: 'auto'
    };



    return (
      <div className="pure-g">
        <div className="pure-u-1-5"></div>
        <div className="pure-u-3-5">
          <header>
            <h1>{this.props.config.title}</h1>
          </header>
          <IntroPage />
        </div>
        <div className="pure-u-1-5"></div>
        <button className="pure-button pure-button-primary button-xlarge" style={completedStyle} onClick={this.onCompleted.bind(this)}>Completed</button>
      </div>
    );
  }
}

export default App;
