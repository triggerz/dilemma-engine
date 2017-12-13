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
        this.props.variables[v] = math.eval(expression.toLowerCase(), this.props.variables);
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
    const video = this.props.config.config.video;
    const image = this.props.config.config.image;
    const videoPanel = (
     <div className="card video">
       <div className="container">
         <iframe title="embedded video" src={video} frameBorder="0" gesture="media" allow="encrypted-media" allowFullScreen></iframe>
       </div>
     </div>
    );
    const imagePanel = (
     <div className="card image">
       <img src={image}></img>
     </div>
    );
    const varNames = Object.keys(this.props.variables);
    const gauges = varNames.map(varName => {
      const value = this.props.variables[varName];
      const g = Math.round(Math.min(100, Math.max(0, +value)) / 100 * 255);
      const color = `rgb(${255 - g}, ${g}, 0)`;
      return (
        <div className="gauge-container" key={varName}>
          <Gauge
            key={varName}
            value={value}
            width={100}
            height={64}
            label={varName}
            color={color}
            minMaxLabelStyle={{display: 'none'}}
            topLabelStyle={{display: 'none'}}
            valueLabelStyle={{color: '#707070', fontSize: '24px'}}
          />
        <span>{varName}</span>
        </div>
      );
    });
    const gaugePanel = gauges.length ? <div className="gauges panel">{gauges}</div> : null;

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
    const choicePanel = choices.length ? <form className="choices-panel">{choices}</form> : null;

    return (
      <div className="game">
        <section className="description block half-width-block">
          {video && videoPanel}
          {image && imagePanel}
          <div className="card">
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{__html: description}} />
          </div>
        </section>
        <section className="sidebar block half-width-block">
          <div className="card">
            {gaugePanel}
          </div>
          {choicePanel && <div className="card">
            {choicePanel}
          </div>}
        </section>
        <button className="next-button" onClick={this.navigate.bind(this)}>Next</button>
      </div>
    );
  }
}

export default Scene;
