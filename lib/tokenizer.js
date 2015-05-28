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
}
var TokenizerPrototype = Tokenizer.prototype;

TokenizerPrototype._flush = function(cb) {
  var slice = this.lastSlice;
  this.processChunk(slice);
  cb();
};

TokenizerPrototype._transform = function(chunk, encoding, cb) {
  var slice = this.lastSlice + chunk.slice();
  this.processChunk(slice);
  cb();
};

TokenizerPrototype.addError = function(token) {
  this.errors.push(token);
};

TokenizerPrototype.numErrors = function() {
  return this.errors.length;
};

TokenizerPrototype.updateFileInfo = function(token) {
  this.fileInfo = this.fileInfo.seek(token.length, token.type === 'nl');
};

TokenizerPrototype.saveLastSlice = function(slice) {
  this.lastSlice = slice;
};

TokenizerPrototype.createToken = function(slice) {
  return this.terminalList.findMatch(slice, this.fileInfo);
};

TokenizerPrototype.processChunk = function(chunk) {
  if (!chunk || chunk.length === 0) return;
  var token, slice = chunk.slice();
  do {
    this.saveLastSlice(slice);
    token = this.createToken(slice);
    slice = slice.slice(token.length);
    // as long as we didn't run out of input in this chunk
    if (slice.length > 0) {
      switch (token.type) {
        case 'error':
          this.addError(token);
          break;
        case 'nl': break;
        case 'ws': break;
        default:
          this.length += 1;
          this.push(token);
          break;
      }
      this.updateFileInfo(token);
      this.emit('token:' + token.type, token);
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
