const createAssign = require('./util/create-assign');

const Token = {

  terminalMatch: null,
  fileInfo: null,
  value: null,

  toString() {
    return this.toBaseString() + " '" + this.value + "'";
  },

  toErrorString() {
    return this.toBaseString() + " '" + this.value.substring(0, 80) + "'";
  },

  toLineString() {
    const fi = this.fileInfo;
    const len = this.length;
    return '(' + fi.toString() + (len > 1 ? '-' + (fi.column + len) : '') + ')';
  },

  toBaseString() {
    return this.toLineString() + ' ' + this.type + ' ';
  },

  get type() {
    return this.terminalMatch.type;
  },

  get length() {
    return this.terminalMatch.length;
  },

  get match() {
    return this.terminalMatch.match;
  },

  get originalValue() {
    return this.terminalMatch.value;
  }

};

function createToken(options = {}) {
  return createAssign(Token, options);
}

module.exports = createToken;
