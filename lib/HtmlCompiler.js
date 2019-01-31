'use strict';
const fs = require('fs');
const process = Symbol('process');
const cache = {};

class HtmlCompiler {
  constructor(config = {}) {
    this.url = config.url || null;
    this._tags = {
      'import': '#import\\([\\s\\S]*?(?=\\))\\)',
      'template': '#template\\([\\s\\S]*?(?=\\))\\)',
      'asset': '#asset\\([\\s\\S]*?(?=\\))\\)',
      'url': '#url\\([\\s\\S]*?(?=\\))\\)',
      'var': '#var\\([\\s\\S]*?(?=\\))\\)',
      'namespace': '#namespace\\([\\s\\S]*?(?=\\))\\)'
    };
    this._namespace = {};
  }
  
  /**
   * Compiles a html file and its partials into a single file
   * Resolves relative url paths into an absolute path
   * Returns compiled html as a String
   */
  compile(path) {
    if ( !this.isHtmlFile(path) ) throw `${path} is not a html file.`;
    let html = this.readHtmlFile(path);
    const param = {
      path: path,
      currdir: this.fileToDir(path),
      html: html,
      namespace: this.namespace
    }
    html = this[process](param);
    return html;
  }

  /**
   * Handles any valid tags that occur within the provided html property.
   * Returns the modified html
   * @param {Object} param 
   * path: The current file path the compilation is on
   * currdir: The working directory of path
   * html: The html content of path
   * namespace: the set of variables that can be imported into the html doc
   */
  [process](param) {
    let tags = this.findTags(param.html);
    while ( tags.length > 0 ) {
      const currtag = tags.shift();
      const tagContent = this.extract(currtag);
      if ( this.matches(this.tags.template, currtag) ) {
        const template = this.readHtmlFile(this.resolvePath(param.currdir, tagContent));
        tags = this.findTags(template).concat(tags);
        const content = param.html.replace(currtag, '');
        param.html = template.replace('#content()', content);
      }
      else if ( this.matches(this.tags.import, currtag) ) param.html = param.html.replace(currtag, this.compile(this.resolvePath(param.currdir, tagContent)));
      else if ( this.matches(this.tags.asset, currtag) || this.matches(this.tags.url, currtag) ) param.html = param.html.replace(currtag, this.resolveAsset(param.currdir, tagContent));
      else if ( this.matches(this.tags.var, currtag) && param.namespace.hasOwnProperty(tagContent)) param.html = param.html.replace(currtag, param.namespace[tagContent]);
      else if ( this.matches(this.tags.namespace, currtag) ) {
        this.defineNamespace(tagContent);
        param.html = param.html.replace(currtag, '');
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

  /**
   * Checks for the namespace tag pattern
   * If it exists, then it will create a namespace
   * @param {String} s 
   */
  defineNamespace(s) {
    s.split(';').filter((pair) => {
      return (pair);
    }).forEach(arg => {
      const propval = arg.split(':');
      this.namespace[propval[0].trim()] = propval[1].trim();
    });
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

  /**
   * Resolves the content of an asset tag to an absolute path.
   * Returns the absolute path.
   * A url must be provided in the constructor for asset and url paths to be resolved.
   * @param {String} currdir 
   * @param {String} path 
   */
  resolveAsset(currdir, path) {
    let url = this.url;
    if ( !url ) {
      console.error('A #url() or #asset() tag was found, but no url was provided to resolve it');
      return path;
    }
    else if ( url[url.length - 1] !== '/' ) url = url + '/';
    switch(path.charAt(0)) {
      // Resolves relative directory urls
      case '.': 
        path = this.resolvePath(currdir, path);
        break;
      // Resolves root relative urls
      case '/': 
        path = path.substring(1, path.length);
        break;
      default: if ( path.includes('http://') || path.includes('https://') || path.includes('www.') ) return path;
    }
    return url + path.replace(/\/+|\\+/g, '/');
  }

  /**
   * Resolves a relative path with the current directory.
   * Returns the resolved path.
   * @param {String} currdir
   * @param {String} relpath 
   */
  resolvePath(currdir, relpath) {
    if ( !['.', '\\', '/'].includes(relpath[0]) ) return relpath.replace(/\\+/g, '/');
    const path = [];
    let curr = this.splitPath(currdir);
    if ( this.isFile(currdir) ) curr = curr.slice(0, curr.length - 1);
    curr.forEach(p => path.push(p));
    this.splitPath(relpath).forEach(p => {
      if ( /^\.\./.test(p) ) path.pop();
      else if ( /^\./.test(p) || path.includes(p) ) return;
      else path.push(p);
    });
    return path.join('/');
  }
  
  /**
   * Empties the cache used for compilation.
   */
  clearCache() {
    Object.keys(cache).forEach(key => {
      if ( cache.hasOwnProperty(key) ) delete cache[key];
    });
  }

  /**
   * Returns the highest level directory to the given path.
   * @param {String} path 
   */
  fileToDir(path) {
    const pathArray = this.splitPath(path);
    return pathArray.slice(0, pathArray.length - 1).join('\\');
  }

  /**
   * Returns the content inside a tag.
   * @param {String} s 
   */
  extract(s) {
    return s.slice(s.indexOf('(') + 1, s.lastIndexOf(')')).replace(/[\s]*(?<=[\r\n|\n])\s*/g, '');
  }

  /**
   * Splits a filepath into an array.
   * @param {String} path 
   */
  splitPath(path) {
    return path.split(/\/|\\/g);
  }

  matches(tag, s) {
    return new RegExp(tag, 'g').test(s);
  }

  /**
   * Checks whether path exists or not.
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
   * Checks if path is a file.
   * @param {String} path 
   */
  isFile(path) {
    try { return fs.statSync(path).isFile(); }
    catch(err) { return false; }
  }
  
  /**
   * Checks if path is a html file.
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

  get namespace() {
    return this._namespace;
  }

  get cache() {
    return cache;
  }
}
module.exports = HtmlCompiler;
