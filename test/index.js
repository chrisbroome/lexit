/* eslint-disable no-console */
/* eslint-env node */
import fs from 'fs'
import stream from 'stream'
import createTerminal from '../src/terminal'
import createTerminalList from '../src/terminal-list'
import createTokenizer from '../src/tokenizer'

;(function main() {
  const terminalArray = [
    ['+', /^(\+)/],
    ['-', /^(\-)/],
    ['*', /^(\*)/],
    ['/', /^(\/)/],
    ['(', /^(\()/],
    [')', /^(\))/],
    ['[', /^(\[)/],
    [']', /^(])/],
    ['{', /^(\{)/],
    ['}', /^(})/],
    ['=>', /^(=>)/],
    ['>', /^(>)/],
    ['<', /^(<)/],
    ['>=', /^(>=)/],
    ['<=', /^(<=)/],
    ['==', /^(==)/],
    ['===', /^(===)/],
    ['!=', /^(!=)/],
    ['!==', /^(!==)/],
    ['.', /^(\.)/],
    [',', /^(,)/],
    [':', /^(:)/],
    ['?', /^(\?)/],
    ['&', /^(&)/],
    ['|', /^(\|)/],
    ['&&', /^(&&)/],
    ['||', /^(\|\|)/],
    ['^', /^(\^)/],
    ['=', /^(=)/],
    [';', /^(;)/],
    ['nl', /^(\n)/],
    ['ws', /^(\s+)/],
    ['line-comment', /^(\/\/.*)/],
    ['block-comment', /^(\/\*\*\/)/],
    ['block-comment', /^(\/\*((\*[^/]|[^\*])+)\*\/)/],
    ['bool-literal', /^(true)/],
    ['bool-literal', /^(false)/],
    ['null-literal', /^(null)/],
    ['numeric-literal', /^(-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?)/],
    ['string-literal', /^('')/],
    ['string-literal', /^('(((?:\\(?:['\\/bfnrt]|u[0-9a-fA-F]{4}))|[^'\\])+)')/],
    ['string-literal', /^("")/],
    ['string-literal', /^("(((?:\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))|[^"\\])+)")/],
    ['regexp-literal', /^(\/(.*)\/)/],
    ['keyword', /^(var|function|return|const|let|new|delete)/],
    ['identifier', /^([a-zA-Z_][a-zA-Z_0-9]*)/]
  ].map(item => {
    const [type, expression] = item
    return createTerminal({type, expression})
  })

  const terminals = createTerminalList({items: terminalArray})
  const whitespaceFilter = getWhitespaceFilter()
  const tokenizer = getTokenizer(terminals)
  const input = getInputStream()
  const outputTransform = getOutputTransformStream()

  return input.pipe(tokenizer)
    .pipe(whitespaceFilter)
    .pipe(outputTransform)
    .pipe(process.stdout)

}())

function getWhitespaceFilter() {
  const filter = new stream.Transform({objectMode: true})
  filter._transform = function(token, encoding, cb) {
    if (token.type === 'nl' || token.type === 'ws') return cb()
    this.push(token)
    this.emit('token', token)
    cb()
  }
  filter._flush = function(cb) {
    cb()
  }
  return filter
}

function getOutputTransformStream() {
  const outputTransform = new stream.Transform({writableObjectMode: true})
  outputTransform._transform = function(token, encoding, cb) {
    this.push(token.toString() + '\n')
    cb()
  }
  outputTransform._flush = function(cb) {
    cb()
  }
  return outputTransform
}

/**
 * @return {Stream.Readable}
 */
function getInputStream() {
  const filename = process.argv[2]
  const inputStream = filename ? fs.createReadStream(filename) : process.stdin

  inputStream.on('error', function(err) {
    console.error('inputStream:error:', err)
  })

  return inputStream
}

/**
 * @return {Tokenizer}
 */
function getTokenizer(terminals, tokenFactory) {
  const tokenizer = createTokenizer(terminals, tokenFactory)

  tokenizer.on('error', function(err) {
    console.error('tokenizer:error:', err)
    process.exit(1)
  })

  tokenizer.on('finish', function() {
    console.log(tokenizer.toString())
  })

  return tokenizer
}
