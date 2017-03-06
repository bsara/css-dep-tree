/**
 * @callback apiCallback
 * @param {(String|Error)} err     - TODO: Add description
 * @param {(Object)        results - TODO: Add description
 */


const fs   = require('fs');
const path = require('path');




// Public API
//---------------------------------------------------------------

/**
 * @param {!String} filePath
 *
 * @param {(Object|Function)} [options]
 * @param {Boolean}           [options.relative = false]
 * @param {Boolean}           [options.excludeTree = false]
 * @param {Boolean}           [options.excludeFiles = false]
 * @param {Boolean}           [options.excludeURLs = false]
 *
 * @param {apiCallback} [callback]
 *
 * @returns {Promise}
 */
function cssDepTree(filePath, options = {}, callback = (() => {})) { // eslint-disable-line no-empty-function
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  const {
    relative,
    excludeTree,
    excludeFiles,
    excludeURLs
  } = options;

  const allFilePaths = (!excludeFiles ? new Set() : undefined);
  const allURLs      = (!excludeURLs ? new Set() : undefined);

  return new Promise(function(resolve, reject) {
    _findImports(filePath, relative, excludeTree, allFilePaths, allURLs).then(function(tree) {
      const ret = {};

      if (!excludeTree) {
        ret.tree = tree;
      }

      if (!excludeURLs) {
        ret.urls = Array.from(allURLs);
      }

      if (!excludeFiles) {
        ret.files = Array.from(allFilePaths);
      }

      resolve(ret);
      callback(undefined, ret);
    })
    .catch((err) => {
      reject(err);
      callback(err);
    });
  });
}


/**
 * @param {!String}            filePath
 * @param {(Boolean|Function)} [relative = false]
 * @param {apiCallback}        [callback]
 *
 * @returns {Promise}
 */
function files(filePath, relative, callback = (() => {})) { // eslint-disable-line no-empty-function
  if (typeof relative === 'function') {
    callback = relative;
    relative = false;
  }

  return cssDepTree(filePath, { relative, excludeTree: true, excludeURLs: true })
           .then((results) => callback(undefined, results.files))
           .catch(callback);
}


/**
 * @param {!String}            filePath
 * @param {(Boolean|Function)} [relative = false]
 * @param {apiCallback}        [callback]
 *
 * @returns {Promise}
 */
function urls(filePath, relative, callback = (() => {})) { // eslint-disable-line no-empty-function
  if (typeof relative === 'function') {
    callback = relative;
    relative = false;
  }

  return cssDepTree(filePath, { relative, excludeTree: true, excludeFiles: true })
           .then((results) => callback(undefined, results.urls))
           .catch(callback);
}




// Module API
//---------------------------------------------------------------

cssDepTree.files = files;
cssDepTree.urls  = urls;

module.exports = cssDepTree;




// Private Helpers
//---------------------------------------------------------------

/**
 * @param {String}  filePath
 * @param {Boolean} relative
 * @param {Boolean} excludeTree
 * @param {Set}     allFilePaths
 * @param {Set}     allURLs
 *
 * @returns {Promise}
 *
 * @private
 */
function _findImports(filePath, relative, excludeTree, allFilePaths, allURLs) {
  filePath = path.resolve(filePath);

  if (relative) {
    filePath = path.relative(process.cwd(), filePath);
  }

  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, function(err, fileContent) {
      if (err) {
        reject(err);
        return;
      }

      if (allFilePaths != null) {
        allFilePaths.add(filePath);
      }

      _processFileContent(path.dirname(filePath), fileContent, relative, excludeTree, allFilePaths, allURLs)
        .then((treeNode) => resolve((treeNode == null) ? undefined : { [filePath]: treeNode }))
        .catch(reject);
    });
  });
}


/**
 * @param {String}  rootDir
 * @param {String}  fileContent
 * @param {Boolean} relative
 * @param {Boolean} excludeTree
 * @param {Set}     allFilePaths
 * @param {Set}     allURLs
 *
 * @returns {Promise}
 *
 * @private
 */
function _processFileContent(rootDir, fileContent, relative, excludeTree, allFilePaths, allURLs) {
  return new Promise(function(resolve, reject) {
    const importRegex = _getImportRegex();
    const treeNode    = (excludeTree ? undefined : {});
    const promises    = [];


    let execResults;

    while ((execResults = importRegex.exec(fileContent)) != null) {
      let matchedPath = execResults[2];

      if (matchedPath == null && matchedPath.trim().length) {
        continue;
      }

      matchedPath = matchedPath.trim();


      if (matchedPath.match(/^(\/\/|\w:\/\/)/) != null) {
        if (treeNode != null) {
          treeNode.urls = (treeNode.urls || []);
          treeNode.urls.push(matchedPath);
        }

        if (allURLs != null) {
          allURLs.add(matchedPath);
        }

        continue;
      }


      const importPath = path.join(rootDir, matchedPath);


      promises.push(_findImports(importPath, relative, excludeTree, allFilePaths, allURLs));
    }


    let promisesResolutionCallback = resolve;

    if (treeNode != null) {
      promisesResolutionCallback = function(childTreeNodes) {
        if (childTreeNodes == null || !childTreeNodes.length) {
          resolve((treeNode.urls == null) ? null : treeNode);
          return;
        }

        treeNode.files = {};

        childTreeNodes.forEach(function(childTreeNode) {
          Object.assign(treeNode.files, childTreeNode);
        });

        resolve(treeNode);
      };
    }

    Promise.all(promises)
           .then(promisesResolutionCallback)
           .catch(reject);
  });
}


/**
 * @returns {RegExp}
 * @private
 */
function _getImportRegex() {
  return /@import\s+url\s*\(("|'|)([^"'\)]+)("|'|)\)/gi; // eslint-disable-line no-useless-escape
}
