'use strict';
const fs = require('fs');

/**
 * Checks whether path exists or not
 * Returns Boolean
 * @param {String} path 
 */
function pathExists(path) {
  try { return fs.existsSync(path); }
  catch(err) {
    console.error(err);
    return false;
  }
}

/**
 * Checks whether path is a directory or not
 * @param {String} path 
 */
function isDir(path) {
  try { return fs.statSync(path).isDirectory(); }
  catch(err) {
    console.error(err);
    return false;
  }
}

/**
 * Checks whether path is a file or not
 * @param {String} path 
 */
function isFile(path) {
  try { return fs.statSync(path).isFile(); }
  catch(err) {
    console.error(err);
    return false;
  }
}

/**
 * Checks whether path is a html file or not
 * @param {String} path 
 */
function isHtmlFile(path) {
  try { 
    if ( !isFile(path) ) return false;
    const type = path.split('.')[-1];
    return ( type === 'html' || type === 'htm' );
  }
  catch(err) {
    console.error(err);
    return false;
  }
}



module.exports = {
  'pathExists': pathExists
};
