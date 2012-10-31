var Module = require('module');


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
      return mockRequire(obj, key, module.parent);
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
 * @param {Object} parent
 */
function mockRequire(filename, stub, parent) {
  filename = Module._resolveFilename(filename, parent);
  var existed = !!require.cache[filename];
  var original;
  if (existed) {
    original = require.cache[filename].exports;
  } else {
    var m = require.cache[filename] = new Module(filename, parent);
    m.loaded = true;
    m.exports = stub;
  }

  requireMocks.push({
    filename: filename,
    existed: existed,
    original: original
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
  filename = Module._resolveFilename(filename, module.parent);
  delete require.cache[filename];
  return require(filename);
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
