'use strict';

/* globals describe, it */

var chai = require('chai'),
    expect = chai.expect;

var utils = require('../lib/utils');

function test(obj, expected) {
  expect(utils.normalizeGeoJsonGeometry(obj)).to.deep.equals(expected);
}

describe('geoJSON validation', function() {

  it('filter invalid ', function() {
    test({}, null);
    test({type:'point', coordinates:[]}, null);
    test({type:'Point', coordinates:'select *'}, null);
    test({type:'Point', coordinates: ['a', 'b']}, null);
  });

  it('clean additional properties', function() {
    test({type:'Point', coordinates: [0, 0], extra: 'foo'}, {type:'Point', coordinates: [0, 0]});
  });

});
