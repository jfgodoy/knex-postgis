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
