var R = require('ramda');
var md = require('marked');

function parse (str, arrayHeaders = []) {
  const tokens = md.lexer(str);

  let currentSection = {};
  let sections = {};
  let currentArray = null;

  tokens.forEach(token => {
    if (token.type === 'heading') {
      const sectionName = normalize(token.text);
      if (R.contains(sectionName, arrayHeaders)) {
        currentArray = `${sectionName}s`;
        if (!sections.hasOwnProperty(currentArray)) {
          sections[currentArray] = [];
        }
        currentSection = {};
        sections[currentArray].push({[sectionName]: currentSection});
      } else {
        currentSection = {};
        if (currentArray) {
          const index = sections[currentArray].length - 1;
          sections[currentArray][index][sectionName] = currentSection;
        } else {
          sections[sectionName] = currentSection;
        }
      }
    } else if (token.type === 'text') {
      if (token.text.indexOf(':') !== -1) {
        const rawKey = token.text.substr(0, token.text.indexOf(':'));
        const key = normalize(rawKey);
        const value = token.text.substr(token.text.indexOf(':') + 1).trim();
        currentSection[key] = value;
      } else {
        const key = normalize(token.text);
        currentSection[key] = undefined;
      }
    } else if (token.type === 'paragraph') {
      if (currentSection.hasOwnProperty('(text)')) {
        currentSection['(text)'] += '\n\n';
      } else {
        currentSection['(text)'] = '';
      }
      currentSection['(text)'] += token.text;
    }
  });

  const traverse = obj => {
    if (typeof obj === 'string') {
      return obj;
    }
    if (R.keys(obj).length === 0) {
      return '';
    }

    return R.map(element => {
      // If there is only text, turn the object into a string.
      if (element.hasOwnProperty('(text)') && Object.keys(element).length === 1) {
        return element['(text)'];
      }
      return traverse(element);
    }, obj);
  };

  return traverse(sections);
}

module.exports = parse;

function normalize(str) {
  function capitalize(s) {
    if (!s.length) return '';
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  }

  const words = str.trim().split(' ');
  return R.reduce((acc, elem) => acc + capitalize(elem), words[0].toLowerCase(), words.slice(1));
}
