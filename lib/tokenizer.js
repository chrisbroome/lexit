const {Transform} = require('stream');
const createAssign = require('./util/create-assign');
const createFileInfo = require('./file-info');

const TokenizerProto = createAssign(Transform.prototype, {

  _transform(chunk, encoding, cb) {
    const slice = this.lastSlice + chunk.slice();
    this._processChunk(slice);
    if (this.hasErrors()) this.emit('error', this.errors);
    cb();
  },

  _flush(cb) {
    const slice = this.lastSlice;
    this._processChunk(slice);
    cb();
  },

  _processChunk(chunk) {
    if (!chunk || chunk.length === 0) return;
    let slice = chunk.slice();
    do {
      this.saveLastSlice(slice);
      const token = this.getNextTokenMatch(slice);

      // not necessarily an error - if we're at the end of the chunk, we'll try again when more data has been piped in
      if (token.length < 0) return;

      slice = slice.slice(token.length);

      // as long as we didn't run out of input in this chunk
      if (slice.length > 0) {
        if (token.type === 'error') this.addError(token);
        else this.pushToken(token);
        this.updateFileInfo(token);
        this.emit('token:' + token.type, token);
        this.emit('token', token);
      }
    } while (slice.length > 0);
  },

  addError(token) {
    this.errors.push(token);
  },

  hasErrors() {
    return this.numErrors() > 0;
  },

  numErrors() {
    return this.errors.length;
  },

  updateFileInfo(token) {
    this.fileInfo = this.fileInfo.seek(token.length, token.type === this.newlineTerminal);
  },

  saveLastSlice(slice) {
    this.lastSlice = slice;
  },

  /**
   * @param {String} slice
   * @return {TokenMatch}
   */
  getNextTokenMatch(slice) {
    return this.terminalList.findMatch(slice, this.fileInfo);
  },

  pushToken(token) {
    this.length += 1;
    this.push(token);
  },

  toString() {
    return 'Tokenized ' + this.length + ' strings. ' + this.numErrors() + ' errors.\n' + this.errorStrings().join('\n');
  },

  errorStrings() {
    return this.errors.map(function(token) {
      return token.toErrorString();
    });
  }

});

/**
 * @param terminalList
 * @param options
 * @returns {object}
 */
function createTokenizer(terminalList, options = {}) {
  const opts = Object.assign({}, options, {objectMode: true});
  const obj = createAssign(TokenizerProto, {
    terminalList,
    fileInfo: createFileInfo(),
    lastSlice: '',
    length: 0,
    errors: [],
    newlineTerminal: opts.newlineTerminal || 'nl'
  });
  Transform.call(obj, opts);
  return obj;
}

module.exports = createTokenizer;
