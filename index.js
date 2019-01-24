'use strict';
const HtmlCompiler = require('./lib/HtmlCompiler.js');

module.exports = HtmlCompiler;

const c = new HtmlCompiler({url: 'http://mysite.com'});
const s = c.compile('__test__/example/example1.html');
console.log(s);
