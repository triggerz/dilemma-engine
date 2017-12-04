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
  constructor (props) {
    super(props);

    this.state = {
      selectedChoice: null
    };
  }

  navigate() {
    const nextSceneId = this.props.config.config.next;
    if (this.props.config.choices) {
      const choice = this.props.config.choices[this.state.selectedChoice];
      const varsToProcess = Object.keys(choice).filter(c => c !== '(title)' && c!== 'next');

      varsToProcess.forEach(v => console.log('Processing ', v, ': ', choice[v]));

      console.log('Selected choice: ', choice);

    }
    this.props.onNavigate(nextSceneId);
  }

  onChoose(changeEvent) {
    this.setState({
      selectedChoice: changeEvent.target.value
    });
  }

  render () {
    const title = this.props.config.config.title;
    const combinedText = this.props.config.description['(text)'].join('\n\n');
    const text = md(combinedText, {renderer});

    const varNames = Object.keys(this.props.variables);
    const gauges = varNames.map(varName => {
      const value = this.props.variables[varName];
      return <Gauge key={varName} value={value} width={80} height={64} label={varName} minMaxLabelStyle={{display: 'none'}} />;
    });

    let choices;
    if (this.props.config.choices) {
      const choiceKeys = Object.keys(this.props.config.choices);
      const choiceOptions = choiceKeys.map(choiceKey => {
        const choice = this.props.config.choices[choiceKey];
        return (
          <div key={choiceKey}>
            <input type="radio" name="choice" id={choiceKey} value={choiceKey} onChange={this.onChoose.bind(this)} />
            <label htmlFor={choiceKey}>{choice['(title)']}</label>
          </div>
        );
      });
      choices = (
        <form action="">
          {choiceOptions}
        </form>
      );
    }
  
    return (
      <div>
        {gauges}
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{__html: text}} />
        {choices}
        <button className="pure-button pure-button-primary" onClick={this.navigate.bind(this)}>Next</button>
      </div>
    );
  }
}

export default Scene;
