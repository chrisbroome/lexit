/**
 * @constructor
 * @param {TerminalMatch[]} items
 */
function TerminalMatchList(items) {
  this.items = items;
}

TerminalMatchList.prototype[Symbol.iterator] = function() {
  return this.items[Symbol.iterator]();
};

Object.defineProperties(TerminalMatchList.prototype, {

  length: {
    enumerable: true,
    get: function() {
      return this.items.length;
    }
  }

});

/**
 * @return {TerminalMatch}
 */
TerminalMatchList.prototype.getBestMatch = function() {
  var bestMatch = null;
  for (var tm of this) {
    if (!bestMatch || bestMatch.length < tm.length) bestMatch = tm;
  }
  return bestMatch;
};

/** @type {TerminalMatchList} */
module.exports = TerminalMatchList;
