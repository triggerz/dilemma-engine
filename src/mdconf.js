var R = require('ramda');
var md = require('marked');

function parse (str) {
  const tokens = md.lexer(str);

  let currentSection = {};
  let sections = {};

  tokens.forEach(token => {
    if (token.type === 'heading') {
      const sectionName = normalize(token.text);
      if (!sections.hasOwnProperty(sectionName)) {
        sections[sectionName] = [];
      }
      currentSection = {};
      sections[sectionName].push(currentSection);
    } else if (token.type === 'text') {
      const rawKey = token.text.substr(0, token.text.indexOf(':'));
      const key = normalize(rawKey);
      const value = token.text.substr(token.text.indexOf(':') + 1).trim();
      currentSection[key] = value;
    } else if (token.type === 'paragraph') {
      if (currentSection.hasOwnProperty('(text)')) {
        currentSection['(text)'] += '\n\n';
      } else {
        currentSection['(text)'] = '';
      }
      currentSection['(text)'] += token.text;
    }
  });

  sections = R.map(section => {
    section = R.map(element => {
      // If there is only text, turn the object into a string.
      if (element.hasOwnProperty('(text)') && Object.keys(element).length === 1) {
        return element['(text)'];
      }
      return element;
    }, section);

    // If there is only one heading with this title, don't make it an array.
    if (section.length === 1) {
      return section[0];
    }
    return section;
  }, sections);

  return sections;
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
