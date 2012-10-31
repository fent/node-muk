var muk    = require('../..');
var assert = require('assert');


module.exports = function testMockDependency(filename) {
  var original = require(filename);

  it('Correctly mocks dependency', function() {
    var mockObject = { existsSync: function() { return true; } };
    var mockedModule = muk(filename, mockObject);

    assert.equal(mockedModule, mockObject,
                 'returned module is mocked object');
    assert.equal(require(filename), mockObject,
                 'when require is called it returns the mocked object');
  });

  it('Restores original module when muk.restore() is called', function() {
    muk.restore();
    assert.equal(require(filename), original,
                 'requiring module again returns orignal module');
  });
};
