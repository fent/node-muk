var muk    = require('..');
var assert = require('assert');


describe('Require a module', function() {
  var sludge = require('./sludge');

  it('Required module has properties', function() {
    assert.equal(sludge.a, 1);
    assert.equal(sludge.b, 2);
    assert.equal(sludge.c, 3);
  });

  describe('Change module properties', function() {
    var sludge2;

    it('Requering again returns modified properties', function() {
      sludge.a = 4;
      sludge.b = 5;
      sludge.c = 6;
      sludge2 = require('./sludge');
      assert.equal(sludge.a, sludge2.a);
      assert.equal(sludge.b, sludge2.b);
      assert.equal(sludge.c, sludge2.c);
    });

    it('And the same object', function() {
      assert.equal(sludge, sludge2);
    });

    it('Requiring using mok() gives back a whole new object', function() {
      var sludge3 = muk('./sludge');
      assert.equal(sludge3.a, 1);
      assert.equal(sludge3.b, 2);
      assert.equal(sludge3.c, 3);
      assert.notEqual(sludge3, sludge);
      assert.notEqual(sludge3, sludge2);
    });
  });
});
