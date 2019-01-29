'use strict';
const fs = require('fs');

const cache = {};

class HtmlCompiler {
  constructor(config = {}) {
    this.url = config.url || null;
    this._tags = {
      'import': /\#import\(.*\..*\)/g,
      'template': /\#template\(.*\..*\)/g,
      'asset': /\#asset\(.*\..*\)/g
    }
  }
  
  /**
   * Compiles a html file and its partials into a single file
   * Resolves relative url paths into an absolute path
   * Returns compiled html as a String
   */
  compile(path) {
    if ( !this.isHtmlFile(path) ) throw `${path} is not a html file.`;
    let htmlString = this.readHtml(path);
    // Get working directory of path
    const pathArray = this.splitPath(path);
    const currdir = pathArray.slice(0, pathArray.length - 1).join('\\');
    const tags = this.findTags(htmlString);
    while ( tags.length > 0 ) {
      const currtag = tags.shift();
      const importPath = this.resolvePath(currdir, this.extractPath(currtag));
      if ( this.isHtmlFile(importPath) ) {
        if ( this.tags.template.test(currtag) ) {
          const template = this.readHtml(importPath);
          this.findTags(template).forEach(t => tags.push(t));
          const importContent = htmlString.replace(currtag, '');
          htmlString = template.replace('#content()', importContent);
        }
        else {
          const importContent = this.compile(importPath);
          htmlString = htmlString.replace(currtag, importContent);
        }
      }
      else if ( this.tags.asset.test(currtag) ) {
        const newUrl = this.resolveAsset(currdir, importPath);
        htmlString = htmlString.replace(currtag, newUrl);
      }
    }
    return htmlString;
  }


  /**
   * Scans a string for all instances of tag matches
   * Returns an array of matched tags
   * @param {String} html 
   */
  findTags(html) {
    const matches = [];
    Object.keys(this.tags).forEach(tag => {
      const a = html.match(this.tags[tag]);
      if ( a ) a.forEach(m => matches.push(m));
    });
    return matches;
  }
  
  clearCache() {
    cache = {};
  }
  /**
   * Reads contents of html file
   * Returns contents as a string
   * Throws when path is not a html file
   * @param {String} path 
   */
  readHtml(path) {
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
      console.error('A #asset() tag was found, but no url was provided to resolve it');
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
   * Returns the filepath inside an import statement
   * @param {String} s 
   */
  extractPath(s) {
    return s.slice(s.indexOf('(') + 1, s.lastIndexOf(')'));
  }

  /**
   * Splits a filepath into an array
   * @param {String} path 
   */
  splitPath(path) {
    return path.split(/\/|\\/g);
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

  get cache() {
    return cache;
  }
}
module.exports = HtmlCompiler;
