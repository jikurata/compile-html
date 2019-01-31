'use strict';
const HtmlCompiler = require('./lib/HtmlCompiler.js');

module.exports = HtmlCompiler;

const compiler = new HtmlCompiler();
console.log(compiler.compile('__test__/example/example1.html'));
