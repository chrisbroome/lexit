import createAssign from './util/create-assign'

const TerminalMatch = {

  type: null,
  match: null,
  input: null,

  get capture() {
    return this.match ? this.match[1] : null
  },

  get length() {
    return this.capture ? this.capture.length : -1
  },

  get value() {
    return this.capture
  }

}

const createTerminalMatch = (options = {}) => createAssign(TerminalMatch, options)

export default createTerminalMatch
