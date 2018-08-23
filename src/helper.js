var R = require('ramda');

function getOrderedSceneArray (config, answers) {
  const initialSceneId = config.initialScene;
  const initialScene = config.scenes[initialSceneId];
  const numberOfScenes = R.values(config.scenes).length;
  var hasAnswer, scene = initialScene, sceneId = initialSceneId, hasQuestion;
  var sceneArray = [];

  for (var i = 0; i < numberOfScenes; i++) {
    hasQuestion = !!scene.choices.length;
    hasAnswer = answers && !!answers[sceneId];
    sceneArray.push({sceneId, scene, hasQuestion, hasAnswer, choices: scene.choices});
    sceneId = scene.config.next;
    scene = sceneId && config.scenes[sceneId];
  }
  return sceneArray;
}


module.exports = {
  getOrderedSceneArray
};
