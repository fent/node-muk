'use strict';

var mockMethod = require('./method');
var mockRequire = require('./require');


/**
 * Mocks a member of an object.
 *
 * @param {Object|string} obj
 * @param {!string|Object} key
 * @param {!Function} method
 */
var muk = module.exports = function mock(obj, key, method) {
  if (typeof obj === 'string') {
      return mockRequire(obj, key, module.parent);
  } else {
    mockMethod(obj, key, method);
  }
};

/**
 * check whether the member of the object is mocked
 */
muk.isMocked = mockMethod.isMocked;

/**
 * Restore all mocks
 */
muk.restore = mockMethod.restore;

// delete this module from the cache so that the next time it gets
// require()'d it will be aware of the new parent
// in case it gets require()'d from a different directory
delete require.cache[require.resolve(__filename)];
