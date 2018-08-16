import React, { Component } from 'react';
import * as R from 'ramda';
import helper from './helper';

class App extends Component {
  render() {
    const activeSceneId = this.props.activeSceneId;
    const hasChoices = R.path([activeSceneId, 'choices', 'length'], this.props.config.scenes);
    const sceneArray = helper.getOrderedSceneArray(this.props.config);
    const filteredSceneArray = R.filter(scene => scene.choices && scene.choices.length)(sceneArray);
    const currentSceneIndex = hasChoices && R.findIndex(R.propEq('sceneId', activeSceneId))(filteredSceneArray);
    const progress = `${currentSceneIndex + 1}/${filteredSceneArray.length}`;
    return (
      <span className="progress">{hasChoices ? progress : ''}</span>
    );
  }
}

export default App;
