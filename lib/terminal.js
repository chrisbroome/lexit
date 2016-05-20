const createAssign = require('./util/create-assign');

const TerminalMatch = require('./terminal-match');

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
 * @param {String} input
 * @returns {TerminalMatch|null}
 */
Terminal.prototype.match = function(input) {
  const {type, expression} = this;
  const match = input.match(expression);
  return match ? createAssign(TerminalMatch, {type, match, input}) : null;
};

/** @type {Terminal} */
module.exports = Terminal;
