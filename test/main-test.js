var muk    = require('..');
var assert = require('assert');
var fs     = require('fs');


describe('Mock methods', function() {
  var readFile = fs.readFile;
  var mkdir = fs.mkdir;

  it('Contains original methods', function() {
    assert.equal(typeof fs.readFile, 'function',
                 'fs.readFile is function');
    assert.equal(typeof fs.readFileSync, 'function',
                 'fs.readFileSync is function');
  });

  it('Methods are new objects after mocked', function() {
    var readFileMock = function(path, callback) {
      process.nextTick(callback.bind(null, null, 'hello!'));
    };

    var mkdirMock = function(path, callback) {
      process.nextTick(callback.bind(null, null));
    };

    muk(fs, 'readFile', readFileMock);
    muk(fs, 'mkdir', mkdirMock);

    assert.equal(fs.readFile, readFileMock, 'object method is equal to mock');
    assert.equal(fs.mkdir, mkdirMock, 'object method is equal to mock');
  });

  it('No errors calling new mocked methods', function(done) {
    fs.readFile('grimer', function(err, data) {
      if (err) return done(err);

      assert.equal(data, 'hello!', 'data matches');
      done();
    });
  });

  it('Should have original methods after muk.restore()', function() {
    muk.restore();
    assert.equal(fs.readFile, readFile, 'original method is restored');
    assert.equal(fs.mkdir, mkdir, 'original method is restored');
  });
});


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
