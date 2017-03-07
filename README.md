# css-dep-tree [![NPM Package](https://img.shields.io/npm/v/css-dep-tree.svg?style=flat-square)][npm]

[![ISC License](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)][license]

> Generates a CSS dependency tree and dependency file/URL lists based on CSS imports


[Changelog](https://github.com/bsara/repos/css-dep-tree/blob/master/CHANGELOG.md)



<br/>
<br/>



# Install

**Project Install**
```bash
$ npm install --save css-dep-tree
```

**Global Install**
```bash
$ npm install -g css-dep-tree
```



<br/>
<br/>




# Usage

#### Node Library:

```javascript
let cssDepTree = require('css-dep-tree');

// `cssDepTree` returns a `Promise`
cssDepTree('main.css').then((results) => {
  console.log(results);
})
.catch((err) => {
  console.error(err);
});

// `cssDepTree` will also accept a callback
cssDepTree('main.css', (err, results) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(results);
});
```


#### Command Line Tool:

```sh
$ cssdt -h

  Usage:
    [cssdt|cssdeptree] <cssFile> [options]

  Options:
    -r  --relative       Output files paths relative to current directory

    -l  --files-list     Only show list of file dependencies
    -u  --urls-list      Only show list of URL dependencies

    -L  --exclude-files  Exclude all files from output
    -U  --exclude-urls   Exclude all URL dependencies from output
    -T  --exclude-tree   Exclude dependency tree from output (only file and URL lists will be present)

    -c  --compress       Compress output JSON

    -h  --help           Show this message
    -V  --version        Show version number
```



<br/>
<br/>



# API

## cssDepTree(filePath, [options], [callback])

Builds a dependency tree and lists of all file and URL dependencies.


### Parameters

- **filePath** `String`<br/>
  Path to entry CSS file.

- **options** `Object` or `Function`<br/>Operation options. *(If `options` is a `Function`, then it is assumed to be the `callback` parameter).*
  - **relative** `Boolean` *(Default: `false`)*<br/>
    If `true`, all file paths in results are expressed relative to the current directory.
  - **excludeTree** `Boolean` *(Default: `false`)*<br/>
    If `true`, full dependency tree object is excluded from results.
  - **excludeFiles** `Boolean` *(Default: `false`)*<br/>
    If `true`, all file dependency paths are excluded from results.
  - **excludeURLs** `Boolean` *(Default: `false`)*<br/>
    If `true`, all URL dependency paths are excluded from results.

- **callback(err, results)** `Function`<br/>
  Callback function to execute when operation has completed.

### Return Value

**Type:** `Promise<Object>`


The `Object` returned by the `callback` function parameter and `Promise` resolved callback
has three properties:


- **tree** `Object`<br/>
  Represents the full dependency tree. *(Not present if `options.excludeTree` is `true`)*

- **urls** `String[]`<br/>
  Contains all dependency URL paths found in the dependency tree. *(Not present if `options.excludeFiles` is `true`)*

- **files** `String[]`<br/>
  Contains all dependency file paths found in the dependency tree. *(Not present if `options.excludeURLs` is `true`)*


> **NOTE:** Each unique URL and file path will appear only once in the `urls` & `files`
lists, regardless of how many times it appears ion the dependency tree.


#### Example Results Object

```javascript
{
  tree: {
    "file/path/root.css": {
      "urls": [
        "//example.com/my/css/url0.css",
        "http://example.com/my/css/url1.css",
        "https://example.com/my/css/url2.css"
      ],
      files: {
        "file/path/otherRootFile0.css": null,
        "file/path/otherRootFile1.css": null,
        "file/path/otherRootFile2.css": null,
        "file/path/sub-dir/subDirFile.css": {
          urls: [
            "//example.com/my/css/url0.css",
            "//example.com/some/url"
          ],
          files: {
            "file/path/otherRootFile1.css": null
          }
        }
      }
    }
  },
  urls: [
    "//example.com/my/css/url0.css",
    "http://example.com/my/css/url1.css",
    "https://example.com/my/css/url2.css",
    "//example.com/some/url"
  ],
  files: [
    "file/path/otherRootFile0.css",
    "file/path/otherRootFile1.css",
    "file/path/otherRootFile2.css",
    "file/path/sub-dir/subDirFile.css"
  ]
}
```


<br/>
<br/>


## cssDepTree.files(filePath, [relative], [callback])

Builds a flat list of all file dependencies found in the dependency tree.


### Parameters

- **filePath** `String`<br/>
  Path to entry CSS file.

- **relative** `Boolean` or `Function` *(Default: `false`)*<br/>
  If `true`, all file paths in results are expressed relative to the current directory.
  *(If `relative` is a `Function`, then it is assumed to be the `callback` parameter).*

- **callback(err, results)** `Function`<br/>
  Callback function to execute when operation has completed.


### Return Value

**Type:** `Promise<String[]>`

> **NOTE:** Each unique file path will appear only once in the returned `String[]`,
regardless of how many times it appears ion the dependency tree.


<br/>
<br/>


## cssDepTree.urls(filePath, [relative], [callback])

Builds a flat list of all URL dependencies found in the dependency tree.


### Parameters

- **filePath** `String`<br/>
  Path to entry CSS file.

- **relative** `Boolean` or `Function` *(Default: `false`)*<br/>
  If `true`, all file paths in results are expressed relative to the current directory.
  *(If `relative` is a `Function`, then it is assumed to be the `callback` parameter).*

- **callback(err, results)** `Function`<br/>
  Callback function to execute when operation has completed.


### Return Value

**Type:** `Promise<String[]>`

> **NOTE:** Each unique URL will appear only once in the returned `String[]`, regardless
of how many times it appears ion the dependency tree.




<br/>
<br/>
<br/>



# License

ISC License (ISC)

Copyright (c) 2017 Brandon Sara (http://bsara.github.io/)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.





[license]: https://github.com/bsara/css-dep-tree/blob/master/LICENSE "License"
[npm]:     https://www.npmjs.com/package/css-dep-tree "NPM Package: css-dep-tree"
