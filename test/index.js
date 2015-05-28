var
  fs = require('fs'),
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
    ]);

  var tokenizer = getTokenizer(terminals);

  var input = getInputStream();

  return input.pipe(tokenizer);

}());

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

  tokenizer.on('data', function(token) {
    if (token.type !== 'ws') console.log(token.toString());
  });

  tokenizer.on('end', function() {
    console.log(tokenizer.toString());
  });

  return tokenizer;
}
