// keep track of mocks
var mocks = [];


/**
 * Mocks a method of an object.
 *
 * @param {Object} obj
 * @param {string} key
 * @param {!Function} method
 */
var method = module.exports = function mockMethod(obj, key, method) {
  mocks.push({
    obj: obj,
    key: key,
    original: obj[key]
  });
  obj[key] = method === undefined ? function() {} : method;
};


/**
 * Restore all mocks
 */
method.restore = function restoreMocks() {
  for (var i = mocks.length - 1; i >= 0; i--) {
    var m = mocks[i];
    m.obj[m.key] = m.original;
  }
  mocks = [];

  /*
  requireMocks.forEach(function(m) {
    if (m.existed) {
      require.cache[m.filename].exports = m.original;
    } else {
      delete require.cache[m.filename];
    }
  });
  requireMocks = [];
  */
};
