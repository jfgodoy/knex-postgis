'use strict';

var compareVersions = require('compare-versions'),
    chai = require('chai'),
    expect = chai.expect;


var knex = require('knex')({
  dialect: 'postgres'
});

var KNEX_VERSION = require('knex/package').version;

// install postgis extension
require('../lib/index.js')(knex);

function queryBuilder() {
  return knex.queryBuilder ? knex.queryBuilder() : knex();
}

function testSql(func, expected) {
  var sqlRes = func.toSQL();

  if (compareVersions(KNEX_VERSION, '0.11') >= 0) {
    expected.bindings = knex.client.prepBindings(expected.bindings);
  }

  Object.keys(expected).forEach(function(key) {
    expect(sqlRes[key]).to.deep.equal(expected[key]);
  });
}

module.exports = {
  knex: knex,
  queryBuilder: queryBuilder,
  testSql: testSql
};

