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

  it('select with intersects, field name is equals a type defined in WKT', function() {
    testsql(knex()
      .select('id', st.asText('point'))
      .from('points')
      .where(st.intersects('point', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326))),
      'select "id", ST_asText("point") as "point" from "points" where ST_intersects("point", ST_geomFromText(\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\', 4326))');
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

  it('insert with geomFromText Formato EWKT', function() {
    testsql(knex()
      .insert({
        'id': 1,
        'geom': st.geomFromText('SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))')
      })
      .into('points'),
      'insert into "points" ("geom", "id") values (ST_geomFromText(\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\', 4326), ?)');
  });

  it('insert with geomFromGeoJSON text', function() {
    testsql(knex()
      .insert({
        'id': 1,
        'geom': st.geomFromGeoJSON('{"type":"Point","coordinates":[-48.23456,20.12345]}')
      })
      .into('points'),
      'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(\'{"type":"Point","coordinates":[-48.23456,20.12345]}\'), ?)');
  });

  it('insert with geomFromGeoJSON object', function() {
    testsql(knex()
      .insert({
        'id': 1,
        'geom': st.geomFromGeoJSON({type:'Point', coordinates:[-48.23456, 20.12345]})
      })
      .into('points'),
      'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(\'{"type":"Point","coordinates":[-48.23456,20.12345]}\'), ?)');
  });

  it('update a geometry column using geomFromGeoJSON text from another column', function() {
    testsql(knex()
      .update({
        'geom': st.geomFromGeoJSON('geoJsonColumn')
      })
      .table('points'),
      'update "points" set "geom" = ST_geomFromGeoJSON("geoJsonColumn")');
  });

  it('select with asGeoJSON', function() {
    testsql(knex().select('id', st.asGeoJSON('geom')).from('points'),
      'select "id", ST_asGeoJSON("geom") as "geom" from "points"');
  });

  it('allow spaces between WKT type and the first parenthesis', function() {
    testsql(knex()
      .insert({
        'id': 1,
        'geom': st.geomFromText('Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
      })
      .into('points'),
      'insert into "points" ("geom", "id") values (ST_geomFromText(\'Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))\', 4326), ?)');
  });

});

describe('Postgis extras', function() {

  it('define extra functions', function() {
    knex.postgisDefineExtras(function(knex, formatter){
      return {
        utmzone: function(geom) {
          return knex.raw('utmzone(' + formatter.wrapWKT(geom) + ')');
        }
      };
    });

    testsql(knex()
      .select('id', st.utmzone('point').as('utm'))
      .from('points'),
      'select "id", utmzone("point") as "utm" from "points"'
    );

    testsql(knex()
      .select('id', st.utmzone(st.geomFromText('Point(0 0, 0 1)', 4326)).as('utm'))
      .from('points'),
      'select "id", utmzone(ST_geomFromText(\'Point(0 0, 0 1)\', 4326)) as "utm" from "points"'
    );
  });
});
