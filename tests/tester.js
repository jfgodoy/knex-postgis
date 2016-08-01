'use strict';

var chai = require('chai'),
    expect = chai.expect;


var knex = require('knex')({
  dialect: 'postgres'
});

// install postgis extension
require('../lib/index.js')(knex);

function queryBuilder() {
  return knex.queryBuilder ? knex.queryBuilder() : knex();
}

function testSql(func, expected) {
  var sqlRes = func.toSQL();

  Object.keys(expected).forEach(function(key) {
    expect(sqlRes[key]).to.deep.equal(expected[key]);
  });
}

module.exports = {
  knex: knex,
  queryBuilder: queryBuilder,
  testSql: testSql
};

