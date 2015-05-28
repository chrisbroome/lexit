/**
 * @constructor
 * @param {String} type
 * @param {Object} match
 * @param {String} input
 */
function TerminalMatch(type, match, input) {
  this.type = type;
  this.match = match;
  this.input = input;
}
TerminalMatch.prototype = Object.create({}, {

  capture: {
    enumerable: true,
    get: function() {
      return this.match ? this.match[1] : null;
    }
  },

  length: {
    enumerable: true,
    get: function() {
      return this.capture ? this.capture.length : -1;
    }
  },

  value: {
    enumerable: true,
    get: function() {
      return this.capture;
    }
  }

});

/**
 * @param {String} input
 * @return {TerminalMatch}
 */
TerminalMatch.error = function(input) {
  return new TerminalMatch('error', null, input);
};

/** @type {TerminalMatch} */
module.exports = TerminalMatch;
