import createAssign from './util/create-assign'

const Token = {

  terminalMatch: null,
  fileInfo: null,
  value: null,

  toString() {
    const {baseString, value} = this
    return `${baseString} '${value}'`
  },

  get errorString() {
    const {baseString, value, terminalMatch} = this
    return `${baseString} '${(value || terminalMatch.input).substring(0, 80)}'`
  },

  get lineString() {
    const fi = this.fileInfo
    const len = this.length
    const colString = len > 1 ? `-${fi.column + len}`: ''
    return `(${fi}${colString})`
  },

  get baseString() {
    return `${this.lineString} ${this.type}`
  },

  get type() {
    return this.terminalMatch.type
  },

  get length() {
    return this.terminalMatch.length
  },

  get match() {
    return this.terminalMatch.match
  },

  get originalValue() {
    return this.terminalMatch.value
  }

}

export default (options = {}) => createAssign(Token, options)
