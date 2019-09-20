const math = require('mathjs');
const R = require('ramda');

// Helper function from the Ramda cookbook:
//    mapKeys :: (String -> String) -> Object -> Object
const mapKeys = R.curry((fn, obj) =>
  R.fromPairs(R.map(R.adjust(fn, 0), R.toPairs(obj))));

function getOrderedSceneArray (config, answers) {
  const initialSceneId = config.initialScene;
  const initialScene = config.scenes[initialSceneId];
  const numberOfScenes = R.values(config.scenes).length;
  var hasAnswer, scene = initialScene, sceneId = initialSceneId, hasQuestion;
  var sceneArray = [];
  for (var i = 0; i < numberOfScenes; i++) {
    hasQuestion = !!(scene.choices && scene.choices.length);
    hasAnswer = answers && !!answers[sceneId];
    sceneArray.push({sceneId, scene, hasQuestion, hasAnswer, choices: scene.choices});
    sceneId = scene.config.next;
    scene = sceneId && config.scenes[sceneId];
  }
  return sceneArray;
}

function updateScores (variables, scene, selectedChoice) {
  const choice = scene.choices[selectedChoice];
  if (choice.variables) {
    const varsToProcess = choice.variables && Object.keys(choice.variables);

    varsToProcess.forEach(v => {
      let expression = choice.variables[v];

      if (variables[v].export === 'per-page') {
        const value = Number(expression);
        variables[v].scores.push(value);
      } else {
        if (expression.match(/^(\+|-)\d*$/)) { // If the expression is simply +3 etc., add it to the previous value.
          expression = `${v} + ${expression}`;
        }

        // Map names with dashes to the equivalent with underscores.
        const normalizeName = name => name.replace('-', '_');

        const names = R.keys(variables);
        const normalizedExpression = R.reduce((expr, name) => expr.replace(name, normalizeName(name)), expression.toLowerCase(), names);
        const normalizedVariables = R.map(R.prop('score'), mapKeys(normalizeName, variables));

        variables[v].score = math.eval(normalizedExpression, normalizedVariables);
      }
    });
  }
}

function scrollSmoothlyTo (options) {
  const element = options.element || window;
  const axis = options.axis || 'y';
  const scrollYAxis = axis === 'y';
  const scrollTarget = options[axis];
  const transition = options.transition;
  const scroll = scrollYAxis ? element[options.element ? 'scrollTop' : 'scrollY'] : element[options.element ? 'scrollLeft' : 'scrollX'];
  let currentTime = 0;

  // easing equation from https://github.com/danro/easing-js/blob/master/easing.js
  function easeInOutSine (pos) {
    return (-0.5 * (Math.cos(Math.PI * pos) - 1));
  }

  function scrollOn (target) {
    const xAxisScroll = scrollYAxis ? 0 : target;
    const yAxisScroll = scrollYAxis ? target : 0;
    if (options.element) {
      element.scrollLeft = xAxisScroll;
      element.scrollTop = yAxisScroll;
    } else {
      element.scrollTo(xAxisScroll, yAxisScroll);
    }
  }

  // animation loop
  function tick () {
    currentTime += 1 / 60;

    const p = currentTime / (transition / 1000);
    const t = easeInOutSine(p);

    if (p < 1) {
      window.requestAnimationFrame(tick) ||
      window.webkitRequestAnimationFrame(tick) ||
      window.mozRequestAnimationFrame(tick);
      const scrollSum = scroll + ((scrollTarget - scroll) * t);
      scrollOn(scrollSum);
    } else {
      scrollOn(scrollTarget);
    }
  }

  // call it once to g$et started
  tick();
}

function scrollToBottom () {
  scrollSmoothlyTo({ y: document.body.scrollHeight, transition: 400 });
}

function scrollToTop () {
  scrollSmoothlyTo({ y: 0, transition: 400 });
}

module.exports = {
  getOrderedSceneArray,
  scrollToBottom,
  scrollToTop,
  updateScores
};
