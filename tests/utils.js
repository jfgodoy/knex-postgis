'use strict';

/* globals describe, it */

var chai = require('chai'),
    expect = chai.expect;

var utils = require('../lib/utils');

function test(obj, expected) {
  expect(utils.normalizeGeoJsonGeometry(obj)).to.deep.equals(expected);
}

function testError(obj) {
  expect(function() {
    utils.normalizeGeoJsonGeometry(obj);
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
