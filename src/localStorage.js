var R = require('ramda');

function getAllAnswersFromLocalStorage (uuid) {
  const key = `dilemma[${uuid}]`;
  const savedString = window.localStorage.getItem(key);
  return (savedString && JSON.parse(savedString)) || {};
}

function saveToLocalStorage (selectedChoice, activeSceneId, uuid) {
  const savedAnswers = getAllAnswersFromLocalStorage(uuid);
  savedAnswers[activeSceneId] = selectedChoice;
  window.localStorage.setItem(`dilemma[${uuid}]`, JSON.stringify(savedAnswers));
}

function getAnswerFromLocalStorage (next, uuid) {
  const savedAnswers = getAllAnswersFromLocalStorage(uuid);
  return savedAnswers[next];
}

function getInitialScene (config, uuid) {
  const answers = getAllAnswersFromLocalStorage(uuid)
  const initialSceneId = config.initialScene;
  if (R.isEmpty(answers)) {
    return initialSceneId;
  } else { // there are previous answers, so we should skip ahead to the first not answered
    const initialScene = config.scenes[initialSceneId];
    const numberOfScenes = R.values(config.scenes).length;
    var hasAnswer, scene = initialScene, sceneId = initialSceneId, hasQuestion;
    var sceneArray = []
    for (var i = 0; i < numberOfScenes; i++) {
      hasQuestion = !!scene.choices.length;
      hasAnswer = !!answers[sceneId];
      sceneArray.push({sceneId, scene, hasQuestion, hasAnswer});
      sceneId = scene.config.next;
      scene = sceneId && config.scenes[sceneId];
    }
    const lastAnsweredScene = R.findLast(scene => scene.hasAnswer)(sceneArray);
    return lastAnsweredScene.scene.config.next || lastAnsweredScene.sceneId;
  }
}


module.exports = {
  getInitialScene,
  getAllAnswersFromLocalStorage,
  saveToLocalStorage,
  getAnswerFromLocalStorage
};
