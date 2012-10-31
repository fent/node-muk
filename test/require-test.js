var muk    = require('..');
var assert = require('assert');


function testMockDependency(filename) {
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
}


describe('Mock required user land dependency', function() {
  testMockDependency('mocha');
});

describe('Mock required file', function() {
  testMockDependency('./foo');
});

describe('Mock required file in a different dir', function() {
  require('./dir/testMockDependency')('./bar');
});
