import React, { Component } from 'react';
import md from 'marked';
import Gauge from 'react-svg-gauge';
import math from 'mathjs';

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
    let nextSceneId = this.props.config.config.next;
    if (this.props.config.choices) {
      const choice = this.props.config.choices[this.state.selectedChoice];
      const varsToProcess = Object.keys(choice).filter(c => c !== '(title)' && c!== 'next');

      varsToProcess.forEach(v => {
        let expression = choice[v];
        if (expression.match(/^(\+|-)\d*$/)) { // If the expression is simply +3 etc., add it to the previous value.
          expression = `${v} + ${expression}`;
        }
        this.props.variables[v] = math.eval(expression, this.props.variables);
      });

      nextSceneId = choice.next;
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
    const description = md(combinedText, {renderer});

//    const mediaPanel = (
//      <div className="videowrapper">
//        <iframe width="560" height="349" src="https://www.youtube.com/embed/lmyZMtPVodo?rel=0" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen></iframe>
//      </div>
//    );
    const mediaPanel = null;

    const varNames = Object.keys(this.props.variables);
    const gauges = varNames.map(varName => {
      const value = this.props.variables[varName];
      const g = Math.round(Math.min(100, Math.max(0, +value)) / 100 * 255);
      const color = `rgb(${255 - g}, ${g}, 0)`;
      return <Gauge key={varName} value={value} width={80} height={64} label={varName} color={color} minMaxLabelStyle={{display: 'none'}} />;
    });
    const gaugePanel = gauges.length ? <panel className="gauges panel"><div>{gauges}</div></panel> : null;

    const choiceKeys = Object.keys(this.props.config.choices || {});
    const choices = choiceKeys.map(choiceKey => {
      const choice = this.props.config.choices[choiceKey];
      return (
        <div key={choiceKey}>
          <input type="radio" name="choice" id={choiceKey} value={choiceKey} onChange={this.onChoose.bind(this)} />
          <label htmlFor={choiceKey}>{choice['(title)']}</label>
        </div>
      );
    });
    const choicePanel = choices.length ? <form className="choices panel">{choices}</form> : null;
  
    return (
      <div className="game">
        <section className="description">
          {mediaPanel}
          <div className="panel">
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{__html: description}} />
          </div>
        </section>
        <section className="sidebar">
          {gaugePanel}
          {choicePanel}
        </section>
        <button className="next-button pure-button pure-button-primary" onClick={this.navigate.bind(this)}>Next</button>
      </div>
    );
  }
}

export default Scene;
