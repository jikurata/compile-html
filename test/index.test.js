'use strict';
const Taste = require('@jikurata/taste');
const HtmlCompiler = require('../index.js');

Taste.flavor('Filepath resolution')
  .describe('Resolves filepaths relative to the current working directory')
  .test(() => {
    const compiler = new HtmlCompiler();
    Taste.profile.resolvedFilePath = compiler.resolvePath('test', 'test/example/partial1.html');
  })
  .expect('resolvedFilePath').toMatch('test/example/partial1.html');

Taste.flavor('Compiler tag identification')
  .describe('Scans html file for compiler tags')
  .test(() => {
    const compiler = new HtmlCompiler();
    Taste.profile.foundTagCount = compiler.findTags(compiler.readHtmlFile('test/example/example1.html')).length;
  })
  .expect('foundTagCount').toEqual(4);

Taste.flavor('Asset path resolution')
  .describe('Resolves a relative path to an absolute url')
  .test(() => {
    const url = 'http://mysite.com/';
    const currdir = 'dist/partial/foo';
    const path = './bar'
    const compiler = new HtmlCompiler({url: url});
    Taste.profile.resolvedAsset = compiler.resolveAsset(currdir, path);
  })
  .expect('resolvedAsset').toMatch('http://mysite.com/dist/partial/foo/bar');

Taste.flavor('Asset path resolution')
  .describe('Resolves a relative path to an absolute url')
  .test(() => {
    const url = 'http://mysite.com/';
    const currdir = 'dist/partial/foo';
    const path = 'foo/bar'
    const compiler = new HtmlCompiler({url: url});
    Taste.profile.resolvedAsset2 = compiler.resolveAsset(currdir, path);
  })
  .expect('resolvedAsset2').toMatch('http://mysite.com/foo/bar');


Taste.flavor('Asset path resolution')
  .describe('Resolves a relative path to an absolute url')
  .test(() => {
    const url = 'http://mysite.com/';
    const currdir = 'dist/partial/foo';
    const path = '/foo/bar'
    const compiler = new HtmlCompiler({url: url});
    Taste.profile.resolvedAsset3 = compiler.resolveAsset(currdir, path);
  })
  .expect('resolvedAsset3').toMatch('http://mysite.com/foo/bar');

Taste.flavor('Parsing tags')
  .describe('Returns the content inside a tag')
  .test(() => {
    const tag = `#import(/this/is/
      a/filepath.path)`;
    const compiler = new HtmlCompiler();
    Taste.profile.contentInsideTag = compiler.extract(tag);
  })
  .expect('contentInsideTag').toMatch('/this/is/a/filepath.path');

Taste.flavor('Parsing tags')
  .describe('Returns the content inside a tag')
  .test(() => {
    const tag = `#import(/this is/a/filepath.path)`;
    const compiler = new HtmlCompiler();
    Taste.profile.contentInsideTag = compiler.extract(tag);
  })
  .expect('contentInsideTag').toMatch('/this is/a/filepath.path');

Taste.flavor('Define namespace during compilation')
  .describe('Adds foo: bar and baz: foobar to the namespace property')
  .test(() => {
    const namespace = 'foo: bar; baz: foobar;';
    const compiler = new HtmlCompiler();
    compiler.defineNamespace(namespace);
    Taste.profile.namespace = (compiler.namespace.foo === 'bar' && compiler.namespace.baz === 'foobar');
  })
  .expect('namespace').toBeTruthy();

Taste.flavor('Clearing the cache')
  .describe('Cache size should be 0')
  .test(() => {
    const compiler = new HtmlCompiler();
    compiler.clearCache();
    Taste.profile.cacheSize = Object.keys(compiler.cache).length;
  })
.expect('cacheSize').toEqual(0); 
