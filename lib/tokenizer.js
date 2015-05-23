var
  util = require('util'),
  Transform = require('stream').Transform,
  FileInfo = require('./file-info'),
  findMatch = require('./find-match');

util.inherits(Tokenizer, Transform);

/**
 * @constructor
 * @param {Object} matchers
 * @param {tokenFactoryCallback} tokenFactory
 * @param {Object} options
 */
function Tokenizer(matchers, tokenFactory, options) {
  var
    opts = options || {},
    matcherNames = Object.keys(matchers);
  opts.objectMode = true;
  Transform.call(this, opts);
  this.matchers = matchers;
  this.tokenFactory = tokenFactory;
  this.lastSlice = '';
  this.length = 0;
  this.errors = [];
  this.fileInfo = new FileInfo;
  this.matcherNames = matcherNames;
  this.matcherLength = matcherNames.length;
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
  return findMatch(slice, this.fileInfo, this.matcherNames, this.matchers, this.matcherLength, this.tokenFactory);
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
