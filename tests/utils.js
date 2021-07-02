'use strict';

var chai = require('chai'),
    expect = chai.expect;

var utils = require('../lib/utils');

function test(obj, expected) {
  var str = JSON.stringify(obj);
  expect(utils.checkGeoJsonGeometry(str)).to.deep.equals(expected);
}

function testError(obj) {
  expect(function() {
    var str = JSON.stringify(obj);
    utils.checkGeoJsonGeometry(str);
  }).to.throw(Error);
}

describe('geoJSON validation', function() {

  it('filter invalid ', function() {
    testError({});
    testError({type:'point', coordinates:[]});
    testError({type:'Point', coordinates:'select *'});
    testError({type:'Point', coordinates: ['a', 'b']});
  });

  it('clean additional properties', function() {
    test({type:'Point', coordinates: [0, 0], extra: 'foo'}, {type:'Point', coordinates: [0, 0]});
  });

});

describe('isBoolean validation', function() {
  describe('responds `true` for valid booleans', function() {
    it('for true', function() {
      expect(utils.isBoolean(true)).to.true;
    });

    it('for false', function() {
      expect(utils.isBoolean(false)).to.true;
    });
  });

  describe('responds `false` for invalid booleans', function() {
    it('for strings', function() {
      expect(utils.isBoolean('true')).to.false;
    });

    it('for null', function() {
      expect(utils.isBoolean(null)).to.false;
    });

    it('for numbers', function() {
      expect(utils.isBoolean(0)).to.false;
    });

    it('for undefined', function() {
      expect(utils.isBoolean(undefined)).to.false;
    });

    it('for object', function() {
      expect(utils.isBoolean({})).to.false;
    });
  });
});

describe('isNumber validation', function() {
  describe('responds `true` for valid numbers', function() {
    it('for a normal int', function() {
      expect(utils.isNumber(5)).to.true;
    });

    it('for normal float', function() {
      expect(utils.isNumber(5.3)).to.true;
    });

    it('for string integer', function() {
      expect(utils.isNumber('5')).to.true;
    });

    it('for string floats', function() {
      expect(utils.isNumber('5.3')).to.true;
    });
  });

  describe('responds `false` for invalid numbers', function() {

    it('for non-number strings', function() {
      expect(utils.isNumber('banana')).to.be.false;
      expect(utils.isNumber(',32.5')).to.be.false;
    });

    it('for empty strings', function() {
      expect(utils.isNumber('')).to.be.false;
    });

    it('for space strings', function() {
      expect(utils.isNumber(' ')).to.be.false;
    });

    it('for multiple space strings', function() {
      expect(utils.isNumber('     ')).to.be.false;
    });

    it('for null', function() {
      expect(utils.isNumber(null)).to.be.false;
    });

    it('for undefined', function() {
      expect(utils.isNumber(undefined)).to.be.false;
    });

    it('for object', function() {
      expect(utils.isNumber({})).to.be.false;
      expect(utils.isNumber({ test: 'yes' })).to.be.false;
    });

    it('for array', function() {
      expect(utils.isNumber([])).to.be.false;
      expect(utils.isNumber([1, 2, 3])).to.be.false;
    });

    it('for boolean values', function() {
      expect(utils.isNumber(false)).to.be.false;
      expect(utils.isNumber(true)).to.be.false;
    });

    it('for errors', function() {
      expect(utils.isNumber(new Error())).to.be.false;
    });

    it('for functions', function() {
      expect(utils.isNumber(function() {})).to.be.false;
    });
  });
});

describe('isString validation', function() {
  describe('responds `true` for valid strings', function() {
    it('for a normal string', function() {
      expect(utils.isString('banana')).to.true;
    });

    it('for an empty string', function() {
      expect(utils.isString('')).to.true;
    });

    it('for a space string', function() {
      expect(utils.isString(' ')).to.true;
    });
  });

  describe('responds `false` for invalid strings', function() {

    it('for numbers', function() {
      expect(utils.isString(5)).to.be.false;
      expect(utils.isString(32.5)).to.be.false;
    });

    it('for nothing', function() {
      expect(utils.isString()).to.be.false;
    });

    it('for null', function() {
      expect(utils.isString(null)).to.be.false;
    });

    it('for undefined', function() {
      expect(utils.isString(undefined)).to.be.false;
    });

    it('for object', function() {
      expect(utils.isString({})).to.be.false;
      expect(utils.isString({ test: 'yes' })).to.be.false;
    });

    it('for array', function() {
      expect(utils.isString([])).to.be.false;
      expect(utils.isString([1, 2, 3])).to.be.false;
    });

    it('for boolean values', function() {
      expect(utils.isString(false)).to.be.false;
      expect(utils.isString(true)).to.be.false;
    });

    it('for errors', function() {
      expect(utils.isString(new Error())).to.be.false;
    });

    it('for functions', function() {
      expect(utils.isString(function() {})).to.be.false;
    });
  });
});

describe('isWKT validation', function() {
  describe('responds `true` for valid WKTs', function() {
    it('for points', function() {
      var wkt = 'POINT(6 10)';

      expect(utils.isWKT(wkt)).to.be.true;
    });

    it('for linestrings', function() {
      var wkt = 'LINESTRING(3 4,10 50,20 25)';

      expect(utils.isWKT(wkt)).to.be.true;
    });

    it('for polygons', function() {
      var wkt = 'POLYGON((1 1,5 1,5 5,1 5,1 1),(2 2, 3 2, 3 3, 2 3,2 2))';

      expect(utils.isWKT(wkt)).to.be.true;
    });

    it('for multipoints', function() {
      var wkt = 'MULTIPOINT(3.5 5.6, 4.8 10.5)';

      expect(utils.isWKT(wkt)).to.be.true;
    });

    it('for multilinestrings', function() {
      var wkt = 'MULTILINESTRING((3 4,10 50,20 25),(-5 -8,-10 -8,-15 -4))';

      expect(utils.isWKT(wkt)).to.be.true;
    });

    it('for multipolygons', function() {
      var wkt = 'MULTIPOLYGON(((1 1,5 1,5 5,1 5,1 1),(2 2, 3 2, 3 3, 2 3,2 2)),((3 3,6 2,6 4,3 3))';

      expect(utils.isWKT(wkt)).to.be.true;
    });
  });

  describe('responds `false` for invalid WKTs', function() {
    it('for nothing', function() {
      expect(utils.isWKT()).to.be.false;
    });

    it('for null', function() {
      expect(utils.isWKT(null)).to.be.false;
    });

    it('for undefined', function() {
      expect(utils.isWKT(undefined)).to.be.false;
    });

    it('for non-WKT strings', function() {
      expect(utils.isWKT('geom')).to.be.false;
    });
  });
});
