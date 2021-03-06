import {Transform} from 'stream'
import createAssign from './util/create-assign'
import createFileInfo from './file-info'

const TokenizerProto = createAssign(Transform.prototype, {

  _transform(chunk, encoding, cb) {
    const slice = this.lastSlice + chunk.slice()
    this._processChunk(slice, false)
    if (this.hasErrors()) this.emit('error', this.errors)
    cb()
  },

  _flush(cb) {
    const slice = this.lastSlice
    this._processChunk(slice, true)
    cb()
  },

  _processChunk(chunk, lastSlice) {
    if (!chunk || chunk.length === 0) return
    let slice = chunk.slice()
    do {
      this.saveLastSlice(slice)
      const token = this.getNextTokenMatch(slice)

      // if no match was found
      if (token.length < 0) {
        // if we're processing the last slice then this was an error
        if (lastSlice) return this.addError(token)
        // otherwise it's not necessarily an error
        // if we're at the end of the chunk, we'll try again when more data has been piped in
        return
      }

      slice = slice.slice(token.length)

      // as long as we didn't run out of input in this chunk
      if (slice.length > 0) {
        if (token.type === 'error') this.addError(token)
        else this.pushToken(token)
        this.updateFileInfo(token)
        this.emit('token:' + token.type, token)
        this.emit('token', token)
      }
    } while (slice.length > 0)
  },

  addError(token) {
    this.errors.push(token)
  },

  hasErrors() {
    return this.numErrors() > 0
  },

  numErrors() {
    return this.errors.length
  },

  updateFileInfo(token) {
    this.fileInfo = this.fileInfo.seek(token.length, getSeekInfoFromToken.call(this, token))
  },

  saveLastSlice(slice) {
    this.lastSlice = slice
  },

  /**
   * @param {String} slice
   * @return {TokenMatch}
   */
  getNextTokenMatch(slice) {
    return this.terminalList.findMatch(slice, this.fileInfo)
  },

  pushToken(token) {
    this.length += 1
    this.push(token)
  },

  toString() {
    return `Tokenized ${this.length} strings. ${this.numErrors()} errors.\n${this.errorStrings().join('\n')}`
  },

  errorStrings() {
    return this.errors.map(token => token.errorString)
  }

})

function getSeekInfoFromToken(token) {
  if (token.type === this.newlineTerminal) return {newLines: 1, newColumnPos: 0}

  const originalValue = token.originalValue
  if (originalValue.indexOf('\n') < 0) return {newLines: 0}

  const parts = token.originalValue.split('\n')
  const lastItemIndex = parts.length - 1
  const lastItem = parts[lastItemIndex]
  return {
    newLines: lastItemIndex,
    newColumnPos: lastItem.length
  }
}

/**
 * @param terminalList
 * @param {object} [options={}]
 * @returns {object}
 */
const createTokenizer = (terminalList, options = {}) => {
  const opts = Object.assign({}, options, {objectMode: true})
  const obj = createAssign(TokenizerProto, {
    terminalList,
    fileInfo: createFileInfo(),
    lastSlice: '',
    length: 0,
    errors: [],
    newlineTerminal: opts.newlineTerminal || 'nl'
  })
  Transform.call(obj, opts)
  return obj
}

export default createTokenizer
