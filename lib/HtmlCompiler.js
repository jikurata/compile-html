'use strict';

class HtmlCompiler {
  constructor(root) {
    this._root = root;
    this._cache = {};
  }
  
  build() {

  }

  scan(paths = this.root) {
    if ( !Array.isArray ) paths = [paths];
    const queue = paths;
    while ( queue.length > 0 ) {
      const file = queue.shift();
      
    }
  }

  get root() {
    return this._root;
  }

  get cache() {
    return this._cache;
  }
}
module.exports = HtmlCompiler;
