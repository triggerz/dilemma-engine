//import R from 'ramda';
var R = require('ramda');

/**
 * Module dependencies.
 */

var md = require('marked');

/**
 * Parse the given `str` of markdown.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api public
 */

module.exports = function(str, options){
  options = options || {};
  var toks = md.lexer(str);
  var conf = {};
  var keys = [];
  var depth = 0;
  var inlist = false;

  toks.forEach(function(tok){
    switch (tok.type) {
      case 'heading':
        while (depth-- >= tok.depth) keys.pop();
        keys.push(normalize(tok.text));
        depth = tok.depth;
        break;
      case 'list_item_start':
        inlist = true;
        break;
      case 'list_item_end':
        inlist = false;
        break;
      case 'text':
      case 'code':
      case 'paragraph':
        put(conf, keys, tok.text, tok.type);
        break;
    }
  });

  return conf;
};

/**
 * Add `str` to `obj` with the given `keys`
 * which represents the traversal path.
 *
 * @param {Object} obj
 * @param {Array} keys
 * @param {String} str
 * @api private
 */

function put(obj, keys, str, tokenType) {
  var target = obj;
  var last;

  if (tokenType === 'paragraph') {
    keys = keys.concat(['(text)']);
  }

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    last = target;
    target[key] = target[key] || {};
    target = target[key];
  }

  // code
  if (tokenType === 'code') {
    if (!Array.isArray(last[key])) last[key] = [];
    last[key].push(str);
    return;
  }

  if (tokenType === 'text') {
    var i = str.indexOf(':');
    
    // list
    if (-1 == i) {
      if (!Array.isArray(last[key])) last[key] = [];
      last[key].push(str.trim());
      return;
    }
    
    // map
    var key = normalize(str.slice(0, i));
    var val = str.slice(i + 1).trim();
    target[key] = val;
    return;
  }

  if (tokenType === 'paragraph') {
    if (!Array.isArray(last[key])) last[key] = [];
    last[key].push(str.trim());
    return;
  }
}

/**
 * Normalize `str`.
 */

function normalize(str) {
  //return str.replace(/\s+/g, ' ').toLowerCase().trim();
  
  function capitalize(s) { return s[0].toUpperCase() + s.slice(1).toLowerCase(); }
  
  const words = str.trim().split(' ');
  return R.reduce((acc, elem) => acc + capitalize(elem), words[0].toLowerCase(), words.slice(1));
}
