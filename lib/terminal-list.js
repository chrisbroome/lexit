const createAssign = require('./util/create-assign');

const createTerminalMatch = require('./terminal-match');
const createTerminalMatchList = require('./terminal-match-list');
const createToken = require('./token');

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

    return createTerminalMatchList({items});
  }

};

function createTerminalList(options = {}) {
  return createAssign(TerminalList, options)
}

module.exports = createTerminalList;


function createErrorTerminalMatch(input) {
  return createTerminalMatch({type: 'error', match: null, input})
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
  return createToken({terminalMatch, fileInfo, value});
}
