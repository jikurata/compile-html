'use strict';
const HtmlCompiler = require('../index.js');

describe('HtmlCompiler functional tests', () => {
  let compiler = new HtmlCompiler();
  describe('resolvePath resolves the working directory and current path', () => {
    test('Returns __test__/example/partial1.html', () => {
      const path = compiler.resolvePath('__test__', '__test__/example/partial1.html');
      expect(path).toMatch('__test__/example/partial1.html');
    });
  });
  describe('findTags scans a html file for relevant tags', () => {
    test('Returns an array with length 3', () => {
      const tags = compiler.findTags(compiler.readHtmlFile('__test__/example/example1.html'));
      expect(tags.length).toBe(3);
    });
  });
  describe('resolveAsset resolves a relative path into an absolute path', () => {
    test('Returns http://mysite.com/dist/partial/foo/bar', () => {
      const url = 'http://mysite.com/';
      const currdir = 'dist/partial/foo';
      const path = './bar'
      const c = new HtmlCompiler({url: url});
      expect(c.resolveAsset(currdir, path)).toMatch('http://mysite.com/dist/partial/foo/bar')
    });
    test('Returns http://mysite.com/foo/bar', () => {
      const url = 'http://mysite.com/';
      const currdir = 'dist/partial/foo';
      const path = 'foo/bar'
      const c = new HtmlCompiler({url: url});
      expect(c.resolveAsset(currdir, path)).toMatch('http://mysite.com/foo/bar')
    });
    test('Returns http://mysite.com/foo/bar', () => {
      const url = 'http://mysite.com/';
      const currdir = 'dist/partial/foo';
      const path = '/foo/bar'
      const c = new HtmlCompiler({url: url});
      expect(c.resolveAsset(currdir, path)).toMatch('http://mysite.com/foo/bar')
    });
  });
  describe('clearCache empties the compiler cache', () => {
    test('cache size should be 0', () => {
      const c = new HtmlCompiler();
      c.clearCache();
      expect(Object.keys(c.cache).length).toBe(0);
    });
  });
});
