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
    return mockRequire(obj, key);
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
 * @param {string} path
 * @param {Object} module
 */
function mockRequire(path, module) {
  var resolvedPath = require.resolve(path);
  var existed = !!require.cache[resolvedPath];

  requireMocks.push({
    path: resolvedPath,
    existed: existed,
    original: require(path)
  });

  return require.cache[resolvedPath].exports = module;
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
      require.cache[m.path].exports = m.original;
    } else {
      delete require.cache[m.path];
    }
  });
  requireMocks = [];
};
