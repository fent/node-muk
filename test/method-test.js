'use strict';

var muk    = require('..');
var assert = require('assert');
var fs     = require('fs');


describe('Mock methods', function() {
  var readFile = fs.readFile;
  var mkdir = fs.mkdir;

  afterEach(muk.restore);

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
    var readFileMock = function(path, callback) {
      process.nextTick(callback.bind(null, null, 'hello!'));
    };
    muk(fs, 'readFile', readFileMock);

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

    var readFileMock = function(path, callback) {
      process.nextTick(callback.bind(null, null, 'hello!'));
    };
    muk(fs, 'readFile', readFileMock);
    muk(fs, 'readFile', readFileMock);
    muk.restore();
    assert.equal(fs.readFile, readFile, 'mock twices, original method should be restored too');
  });

  it('should mock method on prototype', function() {
    var readFile = fs.readFile;
    var newFs = Object.create(fs);
    var readFileMock = function(path, callback) {
      process.nextTick(callback.bind(null, null, 'hello!'));
    };
    muk(newFs, 'readFile', readFileMock);
    assert.equal(newFs.readFile, readFileMock, 'object method is equal to mock');

    muk.restore();
    assert.equal(newFs.readFile, readFile, 'object method is equal to origin');
  });
});

describe('Mock property', function () {
  var config = {
    enableCache: true,
    delay: 10
  };
  var home = process.env.HOME;

  afterEach(muk.restore);

  it('Contains original property', function () {
    assert.equal(config.enableCache, true, 'enableCache is true');
    assert.equal(config.delay, 10, 'delay is 10');
  });

  it('Property are new after mocked', function () {
    muk(config, 'enableCache', false);
    muk(config, 'delay', 0);
    muk(process.env, 'HOME', '/mockhome');

    assert.equal(config.enableCache, false, 'enableCache is false');
    assert.equal(config.delay, 0, 'delay is 0');
    assert.equal(process.env.HOME, '/mockhome', 'process.env.HOME is /mockhome');
  });

  it('Should have original properties after muk.restore()', function () {
    muk(config, 'enableCache', false);
    muk(config, 'enableCache', false);
    muk(config, 'delay', 0);
    muk(process.env, 'HOME', '/mockhome');
    muk(config, 'notExistProp', 'value');
    muk(process.env, 'notExistProp', 0);
    muk.restore();

    assert.equal(config.enableCache, true, 'enableCache is true');
    assert.equal(config.delay, 10, 'delay is 10');
    assert.equal(process.env.HOME, home, 'process.env.HOME is ' + home);
    assert(!hasOwnProperty(config, 'notExistProp'), 'notExistProp is deleted');
    assert(!hasOwnProperty(process.env, 'notExistProp'), 'notExistProp is deleted');
  });

  it('should mock function when method is null', function() {
    muk(config, 'enableCache');
    assert.equal(typeof config.enableCache, 'function', 'enableCache is function');
    assert.equal(config.enableCache(), undefined, 'enableCache return undefined');
  });

  it('should mock property on prototype', function() {
    var newConfig = Object.create(config);
    muk(newConfig, 'enableCache', false);
    assert.deepEqual(Object.keys(newConfig), ['enableCache'], 'obj should contain properties');
    assert.equal(newConfig.enableCache, false, 'enableCache is false');

    muk.restore();
    assert.equal(newConfig.enableCache, true, 'enableCache is false');
  });
});

describe('Mock getter', function() {
  var obj = {
    get a() {
      return 1;
    }
  };

  afterEach(muk.restore);

  it('Contains original getter', function() {
    assert.equal(obj.a, 1, 'property a of obj is 1');
  });

  it('Methods are new getter after mocked', function() {
    muk(obj, 'a', 2);
    assert.equal(obj.a, 2, 'property a of obj is equal to mock');
  });

  it('Should have original getter after muk.restore()', function() {
    muk(obj, 'a', 2);
    muk.restore();
    assert.equal(obj.a, 1, 'property a of obj is equal to origin');
  });

  it('should mock property on prototype', function() {
    var newObj = Object.create(obj);
    muk(newObj, 'a', 2);
    assert.deepEqual(Object.keys(newObj), ['a'], 'obj should contain properties');
    assert.equal(newObj.a, 2, 'property a of obj is equal to mock');

    muk.restore();
    assert.equal(newObj.a, 1, 'property a of obj is equal to origin');
  });
});

describe('Mock check', function() {

  afterEach(muk.restore);

  it('Should check whether is mocked', function() {
    var obj = {
      a: 1,
    };
    assert.equal(muk.isMocked(obj, 'a'), false, 'obj should not be mocked');

    muk(obj, 'a', 2);
    assert.ok(muk.isMocked(obj, 'a'), 'obj should be mocked');
  });

  it('Should not be enumerable', function() {
    var obj = {
      a: 1,
    };
    muk(obj, 'a', 2);
    assert.deepEqual(Object.keys(obj), ['a']);

    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }
    assert.deepEqual(keys, ['a']);
  });

  it('Should be restored', function() {
    var obj = {
      a: 1,
    };
    muk(obj, 'a', 2);
    assert.equal(muk.isMocked(obj, 'a'), true);
    muk.restore();
    assert.equal(obj.a, 1);
    assert.equal(muk.isMocked(obj, 'a'), false);
  });

  it('Should check different type', function() {
    var obj = {
      a: 1,
      b: '1',
      c: true,
      d: {},
      get e() {
        return 1;
      },
    };
    muk(obj, 'a', 2);
    assert.ok(muk.isMocked(obj, 'a'));

    muk(obj, 'b', '2');
    assert.ok(muk.isMocked(obj, 'b'));

    muk(obj, 'c', false);
    assert.ok(muk.isMocked(obj, 'c'));

    muk(obj, 'd', { d: 1 });
    assert.ok(muk.isMocked(obj, 'd'));

    muk(obj, 'e', 2);
    assert.ok(muk.isMocked(obj, 'e'));
  });

  it('should check process.env', function() {
    muk(process.env, 'HOME', '/mockhome');
    assert.equal(process.env.HOME, '/mockhome');
    assert.ok(muk.isMocked(process.env, 'HOME'));
  });
});

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
