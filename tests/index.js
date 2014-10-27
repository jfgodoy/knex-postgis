'use strict';

/* globals describe, it */

var chai = require('chai'),
    expect = chai.expect;


var knex = require('knex')({
  dialect: 'postgres'
});

// install postgis extension and save a reference in st
var st = require('../lib/index.js')(knex);


function verifySqlResult(expectedObj, sqlObj) {
  Object.keys(expectedObj).forEach(function(key) {
    expect(sqlObj[key]).to.deep.equal(expectedObj[key]);
  });
}

function testsql(func, res) {
  var sqlRes = func.toSQL();

  if (typeof res === 'string') {
    verifySqlResult({
      sql: res
    }, sqlRes);
  } else {
    verifySqlResult(res, sqlRes);
  }
}


describe('Postgis functions', function() {

  it('alias', function() {
    testsql(st.asText('geom'), 'ST_asText("geom") as "geom"');
    testsql(st.asText('geom').as('foo'), 'ST_asText("geom") as "foo"');
  });

  it('select with asText', function() {
    testsql(knex().select('id', st.asText('geom')).from('points'),
      'select "id", ST_asText("geom") as "geom" from "points"');
  });

  it('select with asEWKT', function() {
    testsql(knex().select('id', st.asEWKT('geom')).from('points'),
      'select "id", ST_asEWKT("geom") as "geom" from "points"');
  });

  it('select with centroid', function() {
    testsql(knex().select('id', st.centroid('geom')).from('points'),
      'select "id", ST_centroid("geom") from "points"');
  });

  it('select with centroid and asText', function() {
    testsql(knex().select('id', st.asText(st.centroid('geom')).as('centroid')).from('points'),
      'select "id", ST_asText(ST_centroid("geom")) as "centroid" from "points"');
  });

  it('select with intersects, argument in ewkt format', function() {
    testsql(knex()
      .select('id', st.asText('geom'))
      .from('points')
      .where(st.intersects('geom', 'SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))')),
      'select "id", ST_asText("geom") as "geom" from "points" where ST_intersects("geom", \'SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\')');
  });

  it('select with intersects, argument using geomFromText function', function() {
    testsql(knex()
      .select('id', st.asText('geom'))
      .from('points')
      .where(st.intersects('geom', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326))),
      'select "id", ST_asText("geom") as "geom" from "points" where ST_intersects("geom", ST_geomFromText(\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\', 4326))');
  });

  it('insert with geomFromText', function() {
    testsql(knex()
      .insert({
        'id': 1,
        'geom': st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
      })
      .into('points'),
      'insert into "points" ("geom", "id") values (ST_geomFromText(\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\', 4326), ?)');
  });

  it('insert with geomFromGeoJSON', function() {
    testsql(knex()
      .insert({
        'id': 1,
        'geom': st.geomFromGeoJSON('{"type":"Point","coordinates":[-48.23456,20.12345]}')
      })
      .into('points'),
      'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(\'{"type":"Point","coordinates":[-48.23456,20.12345]}\'), ?)');
  });

});
