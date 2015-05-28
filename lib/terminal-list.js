var Terminal = require('./terminal');
var TerminalMatch = require('./terminal-match');
var TerminalMatchList = require('./terminal-match-list');
var Token = require('./token');

/**
 * @constructor
 * @param {Array[]|Terminal[]} [items=[]]
 * @param {tokenFactoryCallback} [tokenFactory=defaultTokenFactory]
 */
function TerminalList(items, tokenFactory) {
  this.items = (items || []).map(function(item) {
    return (item instanceof Terminal) ? item : new Terminal(item[0], item[1]);
  });
  this.tokenFactory = tokenFactory || defaultTokenFactory
}

TerminalList.prototype[Symbol.iterator] = function() {
  return this.items[Symbol.iterator]();
};

Object.defineProperties(TerminalList.prototype, {

  length: {
    enumerable: true,
    get: function() {
      return this.items.length;
    }
  }

});

TerminalList.prototype.findMatch = function(str, fileInfo) {
  var
    terminalMatchList = this.getMatches(str),
    bestMatch = terminalMatchList.length > 0 ? terminalMatchList.getBestMatch() : TerminalMatch.error(str);
  return this.tokenFactory(bestMatch, fileInfo);
};

/**
 * @param {String} str
 * @returns {TerminalMatchList}
 */
TerminalList.prototype.getMatches = function(str) {
  var matches = [];

  for (var terminal of this) {
    var match = terminal.match(str);
    if (match) matches.push(match);
  }

  return new TerminalMatchList(matches);
};

/** @type {TerminalList} */
module.exports = TerminalList;

/**
 * @callback tokenFactoryCallback
 * @param {TerminalMatch} match
 * @param {FileInfo} fileInfo
 * @returns {Token}
 */

/**
 * @type {tokenFactoryCallback}
 */
function defaultTokenFactory(terminalMatch, fileInfo) {
  return new Token(terminalMatch, fileInfo);
}
