# muk [![Build Status](https://secure.travis-ci.org/fent/node-muk.png)](http://travis-ci.org/fent/node-muk)


# Usage

Mock an object's methods.

```js
var fs = require('fs');
var muk = require('muk');

muk(fs, 'readFile', function(path, callback) {
  process.nextTick(callback.bind(null, null, 'file contents here'));
});
```

Mock dependencies too.

**foo.js**
```
var request = require('request');

module.exports = function foo(url) {
  // do something with request
};
```

```js
var mockedRequest = function(url, options, callback) {
  // mock a request here
};

require('request', mockedRequest);
console.log(mockedRequest === require('request')); // true
var foo = muk('./foo');
```

Only userland modules dependencies can be mocked. When muk() is called with one string argument, it will delete that module from the cache and return the `require()`d object, refreshing the module.

You can also mock modules required with a relative path.

```js
muk('./foo', 'hey!!');
console.log(require('./foo.js')); // hey!!
```

Restore all mocked methods and modules after tests.

```
muk.restore();

fs.readFile(file, function(err, data) {
  // will actually read from `file`
});
```


# Install

    npm install muk


# Tests
Tests are written with [mocha](http://visionmedia.github.com/mocha/)

```bash
npm test
```

# License
MIT
