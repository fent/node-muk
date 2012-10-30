var path = require('path');
var sep = path.sep || (process.platform === 'win32' ? '\\' : '/');


// keep track of mocks
var methodMocks = [];
var requireMocks = [];


/**
 * Mocks a method of an object.
 *
 * @param {Object} obj
 * @param {string} key
 * @param {!Function} method
 */
var muk = module.exports = function mock(obj, key, method) {
  if (typeof obj === 'string') {
    return mockRequire(obj, key, module.parent.filename);
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
 * @param {Object} module
 * @param {string} parentFilename
 */
function mockRequire(filename, module, parentFilename) {
  // check if `filename` is relative
  if (filename[0] === '.') {
    var i = parentFilename.lastIndexOf(sep);
    filename = path.resolve(parentFilename.slice(0, i), filename);
  }

  var resolvedFilename = require.resolve(filename);
  var existed = !!require.cache[resolvedFilename];

  requireMocks.push({
    filename: resolvedFilename,
    existed: existed,
    original: require(filename)
  });

  return require.cache[resolvedFilename].exports = module;
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
