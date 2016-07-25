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
