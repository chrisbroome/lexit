const createAssign = require('./util/create-assign');

const TerminalMatch = require('./terminal-match');

const Terminal = {

  type: null,
  expression: null,

  match(input) {
    const {type, expression} = this;
    const match = input.match(expression);
    return match ? createAssign(TerminalMatch, {type, match, input}) : null;
  }

};

module.exports = Terminal;
