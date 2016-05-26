const createAssign = require('./util/create-assign');

const {iterator} = Symbol;

const TerminalMatchList = {
  items: null,

  [iterator]() {
    return this.items[iterator]();
  },

  get length() {
    return this.items.length;
  },

  getBestMatch() {
    let bestMatch = null;
    for (let tm of this) {
      if (!bestMatch || bestMatch.length < tm.length) bestMatch = tm;
    }
    return bestMatch;
  }

};

function createTerminalMatchList(options = {}) {
  return createAssign(TerminalMatchList, options);
}

module.exports = createTerminalMatchList;
