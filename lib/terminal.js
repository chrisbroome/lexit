var
  TerminalMatch = require('./terminal-match');

/**
 * @constructor
 * @param {String} type Grammar symbol
 * @param {RegExp} expression
 */
function Terminal(type, expression) {
  this.type = type;
  this.expression = expression;
}
/**
 * @param {String} str
 * @returns {TerminalMatch|null}
 */
Terminal.prototype.match = function(str) {
  var match = str.match(this.expression);
  return match ? new TerminalMatch(this.type, match, str) : null;
};

/** @type {Terminal} */
module.exports = Terminal;
