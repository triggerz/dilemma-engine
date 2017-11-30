import React, { Component } from 'react';
import parse from './mdconf';

import md from 'marked';

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
      loading: true
     };
  }

  componentDidMount() {
    fetch('scenes/intro/config.md').then(r => r.text()).then(configMarkdown => {
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

    const style = {};

    let backgroundImage;
    if (this.state.scene.config.background) {
      backgroundImage = [
        <div style={{ position: 'absolute', width: '100%', height: '100%', background: `url(${this.state.scene.config.background})`, backgroundSize: 'cover', zIndex: -100, top: '0', left: '0'}} />,
        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity: '0.9', zIndex: -50, top: '0', left: '0'}} />
      ];
    }

    return (
      <div>
        {backgroundImage}
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{__html: text}} />
        <button className="pure-button pure-button-primary button-xlarge">Get started</button>
      </div>
    )
  }
}


class App extends Component {
  render() {

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
      </div>
    );
  }
}

export default App;
