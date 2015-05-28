var
  util = require('util'),
  Transform = require('stream').Transform,
  FileInfo = require('./file-info');

util.inherits(Tokenizer, Transform);

/**
 * @constructor
 * @param {TerminalList} terminalList
 * @param {Object} options
 */
function Tokenizer(terminalList, options) {
  var opts = options || {};
  opts.objectMode = true;
  Transform.call(this, opts);
  this.terminalList = terminalList;
  this.fileInfo = new FileInfo;
  this.lastSlice = '';
  this.length = 0;
  this.errors = [];
  this.newlineTerminal = opts.newlineTerminal || 'nl';
}
var TokenizerPrototype = Tokenizer.prototype;

TokenizerPrototype._transform = function(chunk, encoding, cb) {
  var slice = this.lastSlice + chunk.slice();
  this.processChunk(slice);
  if (this.hasErrors()) this.emit('error', this.errors);
  cb();
};

TokenizerPrototype._flush = function(cb) {
  var slice = this.lastSlice;
  this.processChunk(slice);
  cb();
};

TokenizerPrototype.addError = function(token) {
  this.errors.push(token);
};

TokenizerPrototype.hasErrors = function() {
  return this.numErrors() > 0;
};

TokenizerPrototype.numErrors = function() {
  return this.errors.length;
};

TokenizerPrototype.updateFileInfo = function(token) {
  this.fileInfo = this.fileInfo.seek(token.length, token.type === this.newlineTerminal);
};

TokenizerPrototype.saveLastSlice = function(slice) {
  this.lastSlice = slice;
};

/**
 * @param {String} slice
 * @return {TokenMatch}
 */
TokenizerPrototype.getNextTokenMatch = function(slice) {
  return this.terminalList.findMatch(slice, this.fileInfo);
};

TokenizerPrototype.pushToken = function(token) {
  this.length += 1;
  this.push(token);
};

TokenizerPrototype.processChunk = function(chunk) {
  if (!chunk || chunk.length === 0) return;
  var token, slice = chunk.slice();
  do {
    this.saveLastSlice(slice);
    token = this.getNextTokenMatch(slice);

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
};

TokenizerPrototype.toString = function() {
  return 'Tokenized ' + this.length + ' strings. ' + this.numErrors() + ' errors.\n' + this.errorStrings().join('\n');
};

TokenizerPrototype.errorStrings = function() {
  return this.errors.map(function(token) {
    return token.toErrorString();
  });
};

/** @type {Tokenizer} */
module.exports = Tokenizer;
