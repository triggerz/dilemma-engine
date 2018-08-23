var R = require('ramda');
var helper = require('./helper');

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
  const answers = getAllAnswersFromLocalStorage(uuid);
  if (R.isEmpty(answers)) {
    return config.initialScene;
  } else { // there are previous answers, so we should skip ahead to the first not answered
    const sceneArray = helper.getOrderedSceneArray(config, answers);
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
