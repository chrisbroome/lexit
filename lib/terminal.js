const createAssign = require('./util/create-assign');

const createTerminalMatch = require('./terminal-match');

const Terminal = {

  type: null,
  expression: null,

  match(input) {
    const {type, expression} = this;
    const match = input.match(expression);
    return match ? createTerminalMatch({type, match, input}) : null;
  }

};

function createTerminal(options = {}) {
  return createAssign(Terminal, options)
}

module.exports = createTerminal;
