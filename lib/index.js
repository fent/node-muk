var path = require('path');
var sep = path.sep || (process.platform === 'win32' ? '\\' : '/');


// keep track of mocks
var methodMocks = [];
var requireMocks = [];


/**
 * Mocks a method of an object.
 *
 * @param {Object|string} obj
 * @param {!string|Object} key
 * @param {!Function} method
 */
var muk = module.exports = function mock(obj, key, method) {
  if (typeof obj === 'string') {
    if (key) {
      return mockRequire(obj, key);
    } else {
      return refresh(obj);
    }
  } else {
    mockMethod(obj, key, method);
  }
};


/**
 * Mocks a method of an object.
 *
 * @param {Object} obj
 * @param {string} key
 * @param {!Function} method
 */
function mockMethod(obj, key, method) {
  methodMocks.push({
    obj: obj,
    key: key,
    original: obj[key]
  });
  obj[key] = method || function() {};
}


/**
 * Mocks a call to `require()`
 *
 * @param {string} filename
 * @param {Object} stub
 */
function mockRequire(filename, stub) {
  filename = resolve(filename);
  var existed = !!require.cache[filename];

  requireMocks.push({
    filename: filename,
    existed: existed,
    original: require(filename)
  });

  return require.cache[filename].exports = stub;
}


/**
 * Deletes module from cache and requires it again.
 *
 * @param {string} filename
 * @return {Object}
 */
function refresh(filename) {
  filename = resolve(filename);
  delete require.cache[filename];
  return require(filename);
}


/**
 * Resolve the path to a module.
 *
 * @parma {string} filename
 * @return {string}
 */
function resolve(filename) {
  // check if `filename` is relative
  if (filename[0] === '.') {
    var parentFilename = module.parent.filename;
    var i = parentFilename.lastIndexOf(sep);
    filename = path.resolve(parentFilename.slice(0, i), filename);
  }

  return require.resolve(filename);
}


/**
 * Restore all mocks
 */
muk.restore = function restoreMocks() {
  methodMocks.forEach(function(m) {
    m.obj[m.key] = m.original;
  });
  methodMocks = [];

  requireMocks.forEach(function(m) {
    if (m.existed) {
      require.cache[m.filename].exports = m.original;
    } else {
      delete require.cache[m.filename];
    }
  });
  requireMocks = [];
};


// delete this module from the cache so that the next time it gets
// require()'d it will be aware of the new parent
delete require.cache[require.resolve(__filename)];
