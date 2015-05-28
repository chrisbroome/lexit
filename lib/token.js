/**
 * @constructor
 * @param {TerminalMatch} terminalMatch
 * @param {FileInfo} fileInfo
 */
function Token(terminalMatch, fileInfo) {
  this.terminalMatch = terminalMatch;
  this.fileInfo = fileInfo;
  this.value = terminalMatch.value;
}

Token.prototype = {

  toString: function toString() {
    return this.toBaseString() + " '" + this.value + "'";
  },

  toErrorString: function toErrorString() {
    return this.toBaseString() + " '" + this.value.substring(0, 80) + "'";
  },

  toLineString: function toLineString() {
    var
      fi = this.fileInfo,
      len = this.length;
    return '(' + fi.toString() + (len > 1 ? '-' + (fi.column + len) : '') + ')';
  },

  toBaseString: function toBaseString() {
    return this.toLineString() + ' ' + this.type + ' ';
  }
};

Object.defineProperties(Token.prototype, {

  type: {
    enumerable: true,
    get: function() {
      return this.terminalMatch.type;
    }
  },

  length: {
    enumerable: true,
    get: function() {
      return this.terminalMatch.length;
    }
  },

  match: {
    get: function() {
      return this.terminalMatch.match;
    }
  },

  originalValue: {
    enumerable: true,
    get: function() {
      return this.terminalMatch.value;
    }
  }

});

/** @type {Token} */
module.exports = Token;
