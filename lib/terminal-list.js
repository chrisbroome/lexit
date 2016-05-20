const createAssign = require('./util/create-assign');

const TerminalMatch = require('./terminal-match');
const TerminalMatchList = require('./terminal-match-list');
const Token = require('./token');

const {iterator} = Symbol;

const TerminalList = {
  items: null,
  tokenFactory: defaultTokenFactory,

  [iterator]() {
    return this.items[iterator]();
  },

  get length() {
    return this.items.length;
  },

  findMatch(str, fileInfo) {
    const terminalMatchList = this.getMatches(str);
    const bestMatch = terminalMatchList.length > 0 ?
      terminalMatchList.getBestMatch() :
      createErrorTerminalMatch(str);
    return this.tokenFactory(bestMatch, fileInfo);
  },

  getMatches(str) {
    const items = [];

    for (let terminal of this) {
      const match = terminal.match(str);
      if (match) items.push(match);
    }

    return createAssign(TerminalMatchList, {items});
  }

};

module.exports = TerminalList;


function createErrorTerminalMatch(input) {
  return createAssign(TerminalMatch, {type: 'error', match: null, input})
}

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
  const {value} = terminalMatch;
  return createAssign(Token, {terminalMatch, fileInfo, value});
}
