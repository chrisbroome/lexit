import createAssign from './util/create-assign'
import createTerminalMatch from './terminal-match'

const Terminal = {

  type: null,
  expression: null,

  match(input) {
    const {type, expression} = this
    const match = input.match(expression)
    return match ? createTerminalMatch({type, match, input}) : null
  }

}

const createTerminal = (options = {}) => createAssign(Terminal, options)

export default createTerminal
