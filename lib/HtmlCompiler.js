'use strict';
const fs = require('fs');

const cache = {};

class HtmlCompiler {
  constructor(config = {}) {
    this.url = config.url || null;
    this._tags = {
      'import': '#import\\(.*\\..*\\)',
      'template': '#template\\(.*\\..*\\)',
      'asset': '#asset\\(.*\\..*\\)',
      'url': '#url\\(.*\\)',
      'var': '#var\\(.*\\)'
    };
    this._env = {};
  }
  
  /**
   * Compiles a html file and its partials into a single file
   * Resolves relative url paths into an absolute path
   * Returns compiled html as a String
   */
  compile(path) {
    if ( !this.isHtmlFile(path) ) throw `${path} is not a html file.`;
    let html = this.readHtmlFile(path);
    if ( html.includes('#---') ) {
      Object.assign(this.env, this.parseEnvironment(html));
      html = html.split('#---')[1];
    }
    const param = {
      path: path,
      currdir: this.fileToDir(path),
      html: html,
      env: this.env
    }
    html = this.process(param);
    return html;
  }

  process(param) {
    let tags = this.findTags(param.html);
    console.log(tags);
    while ( tags.length > 0 ) {
      const currtag = tags.shift();
      const importPath = this.resolvePath(param.currdir, this.extract(currtag));
      if ( this.matches(this.tags.template, currtag) ) {
        const template = this.readHtmlFile(importPath);
        tags = this.findTags(template).concat(tags);
        param.html = template.replace('#content()', param.html.replace(currtag, ''));
      }
      else if ( this.matches(this.tags.import, currtag) ) {
        param.html = param.html.replace(currtag, this.compile(importPath));
      }
      else if ( this.matches(this.tags.asset, currtag) || this.matches(this.tags.url, currtag) ) {
        param.html = param.html.replace(currtag, this.resolveAsset(param.currdir, importPath));
      }
      else if ( this.matches(this.tags.var, currtag) ) {
        const prop = this.extract(currtag);
        if ( param.env.hasOwnProperty(prop) ) param.html = param.html.replace(currtag, param.env[prop]);
      }
    }
    return param.html;
  }

  /**
   * Scans a string for all instances of tag matches
   * Returns an array of matched tags
   * @param {String} html 
   */
  findTags(html) {
    const m = [];
    Object.keys(this.tags).forEach(tag => {
      const a = html.match(new RegExp(this.tags[tag], 'g'));
      if ( a ) a.forEach(item => m.unshift(item));
    });
    return m;
  }

  parseEnvironment(s) {
    const index = s.indexOf('#---');
    const o = {};
    if ( index < 0 ) return o;
    s.substring(0, index).replace(/\s/g, '')
    .trim().split(';').filter((pair) => {
      return pair !== '';
    }).forEach(arg => {
      const propval = arg.split(':');
      o[propval[0]] = propval[1];
    });
    return o;
  }
  
  /**
   * Reads contents of html file
   * Returns contents as a string
   * Throws when path is not a html file
   * @param {String} path 
   */
  readHtmlFile(path) {
    try {
      if ( cache[path] ) return cache[path];
      else if ( !this.isHtmlFile(path) ) throw `${path} is not a html file.`
      const content = fs.readFileSync(path, {encoding: 'utf8'});
      cache[path] = content;
      return content;
    }
    catch(err) { console.error(err); }
  }

  resolveAsset(currdir, path) {
    let url = this.url;
    if ( !url ) {
      console.error('A #url() or #asset() tag was found, but no url was provided to resolve it');
      return path;
    }
    else if ( url[url.length - 1] !== '/' ) url = url + '/';
    switch(path.charAt(0)) {
      // Resolves relative directory urls
      case '.': {
        path = this.resolvePath(currdir, path);
        break;
      }
      // Resolves root relative urls
      case '/': {
        path = path.substring(1, path.length);
        break;
      }
      default: {
        if ( path.includes('http://') || path.includes('https://') || path.includes('www.') ) return path;
      }
    }
    return url + path.replace(/\/+|\\+/g, '/');
  }

  /**
   * Resolves a relative path with the current directory
   * Returns the resolved path
   * @param {String} currdir
   * @param {String} relpath 
   */
  resolvePath(currdir, relpath) {
    if ( !['.', '\\', '/'].includes(relpath[0]) ) return relpath.replace(/\\+/g, '/');
    const path = [];
    let a1 = this.splitPath(currdir);
    if ( this.isFile(currdir) ) a1 = a1.slice(0, a1.length - 1);
    a1.forEach(p => path.push(p));
    this.splitPath(relpath).forEach(p => {
      if ( /^\.\./.test(p) ) path.pop();
      else if ( /^\./.test(p) || path.includes(p) ) return;
      else path.push(p);
    });
    return path.join('/');
  }
  
  /**
   * Empties the cache used for compilation
   */
  clearCache() {
    Object.keys(cache).forEach(key => {
      if ( cache.hasOwnProperty(key) ) delete cache[key];
    });
  }

  /**
   * Returns the highest level directory to the given path
   * @param {String} path 
   */
  fileToDir(path) {
    const pathArray = this.splitPath(path);
    return pathArray.slice(0, pathArray.length - 1).join('\\');
  }

  /**
   * Returns the content inside a tag
   * @param {String} s 
   */
  extract(s) {
    return s.slice(s.indexOf('(') + 1, s.lastIndexOf(')'));
  }

  /**
   * Splits a filepath into an array
   * @param {String} path 
   */
  splitPath(path) {
    return path.split(/\/|\\/g);
  }

  matches(tag, s) {
    return new RegExp(tag, 'g').test(s);
  }

  /**
   * Checks whether path exists or not
   * @param {String} path 
   */
  pathExists(path) {
    try { return fs.existsSync(path); }
    catch(err) { 
      console.error(err);
      return false;
    }
  }
  
  /**
   * Checks whether path is a file or not
   * @param {String} path 
   */
  isFile(path) {
    try { return fs.statSync(path).isFile(); }
    catch(err) { return false; }
  }
  
  /**
   * Checks whether path is a html file or not
   * @param {String} path 
   */
  isHtmlFile(path) {
    try { 
      if ( !this.isFile(path) ) return false;
      const type = path.split('.').pop();
      return ( type === 'html' || type === 'htm' );
    }
    catch(err) {  }
  }

  get tags() {
    return this._tags;
  }

  get env() {
    return this._env;
  }

  get cache() {
    return cache;
  }
}
module.exports = HtmlCompiler;
