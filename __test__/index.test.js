'use strict';
const HtmlCompiler = require('../index.js');

describe('HtmlCompiler functional tests', () => {
  let compiler = new HtmlCompiler();
  describe('resolvePath resolves the working directory and current path', () => {
    test('Returns __test__/example/partial1.html', () => {
      const path = compiler.resolvePath('__test__', '__test__/example/partial1.html');
      expect(path).toMatch('__test__\\example\\partial1.html');
    });
  });
  describe('findTags scans a html file for relevant tags', () => {
    test('Returns an array with length 2', () => {
      const tags = compiler.findTags(compiler.readHtml('__test__/example/example1.html'));
      expect(tags.length).toBe(2);
    });
  });
});
