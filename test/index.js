var
  fs = require('fs'),
  stream = require('stream'),
  lexit = require('../'),
  TerminalList = lexit.TerminalList,
  Tokenizer = lexit.Tokenizer,
  Token = lexit.Token;

(function main() {
  var
    terminals = new TerminalList([
      ['+', /^(\+)/],
      ['-', /^(\-)/],
      ['*', /^(\*)/],
      ['/', /^(\/)/],
      ['(', /^(\()/],
      [')', /^(\))/],
      ['^', /^(\^)/],
      ['=', /^(=)/],
      [';', /^(;)/],
      ['nl', /^(\n)/],
      ['ws', /^(\s+)/],
      ['number', /^(-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?)/],
      ['keyword', /^(var)/],
      ['identifier', /^([a-zA-Z_][a-zA-Z_0-9]*)/]
    ]),
    whitespaceFilter = getWhitespaceFilter(),
    tokenizer = getTokenizer(terminals),
    input = getInputStream(),
    outputTransform = getOutputTransformStream();

  return input.pipe(tokenizer)
    .pipe(whitespaceFilter)
    .pipe(outputTransform)
    .pipe(process.stdout);

}());

function getWhitespaceFilter() {
  var filter = stream.Transform({objectMode: true});
  filter._transform = function(token, encoding, cb) {
    if (token.type === 'nl' || token.type === 'ws') return cb();
    this.push(token);
    this.emit('token', token);
    cb();
  };
  filter._flush = function(cb) {
    cb();
  };
  return filter;
}

function getOutputTransformStream() {
  var outputTransform = new stream.Transform({writableObjectMode: true});
  outputTransform._transform = function(token, encoding, cb) {
    this.push(token.toString() + '\n');
    cb();
  };
  outputTransform._flush = function(cb) {
    cb();
  };
  return outputTransform;
}

/**
 * @return {Stream.Readable}
 */
function getInputStream() {
  var
    filename = process.argv[2],
    inputStream = filename ? fs.createReadStream(filename) : process.stdin;

  inputStream.on('error', function(err) {
    console.error('inputStream:error:', err);
  });

  return inputStream;
}

/**
 * @return {Tokenizer}
 */
function getTokenizer(terminals, tokenFactory) {
  var tokenizer = new Tokenizer(terminals, tokenFactory);

  tokenizer.on('error', function(err) {
    console.error('tokenizer:error:', err);
    process.exit(1);
  });

  tokenizer.on('finish', function() {
    console.log(tokenizer.toString());
  });

  return tokenizer;
}
