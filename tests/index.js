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
    testsql(st.asText('geom'), {
      sql: 'ST_asText(?) as "geom"',
      bindings: ['"geom"']
    });

    testsql(st.asText('geom').as('foo'), {
      sql: 'ST_asText(?) as "foo"',
      bindings: ['"geom"']
    });
  });

  it('select with asText', function() {
    testsql(knex().select('id', st.asText('geom')).from('points'), {
      sql: 'select "id", ST_asText(?) as "geom" from "points"',
      bindings: ['"geom"']
    });
  });

  it('select with asEWKT', function() {
    testsql(knex().select('id', st.asEWKT('geom')).from('points'), {
      sql: 'select "id", ST_asEWKT(?) as "geom" from "points"',
      bindings: ['"geom"']
    });
  });

  it('select with centroid', function() {
    testsql(knex().select('id', st.centroid('geom')).from('points'), {
      sql: 'select "id", ST_centroid(?) from "points"',
      bindings: ['"geom"']
    });
  });

  it('select with centroid and asText', function() {
    testsql(knex().select('id', st.asText(st.centroid('geom')).as('centroid')).from('points'), {
      sql: 'select "id", ST_asText(ST_centroid(?)) as "centroid" from "points"',
      bindings: ['"geom"']
    });
  });

  it('select with intersects, argument in ewkt format', function() {
    testsql(
      knex()
        .select('id', st.asText('geom'))
        .from('points')
        .where(st.intersects('geom', 'SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))')),
      {
        sql: 'select "id", ST_asText(?) as "geom" from "points" where ST_intersects(?, ?)',
        bindings: ['"geom"', '"geom"', '\'SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\'']
      });
  });

  it('select with intersects, argument using geomFromText function', function() {
    testsql(
      knex()
        .select('id', st.asText('geom'))
        .from('points')
        .where(st.intersects('geom', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326))),
      {
        sql: 'select "id", ST_asText(?) as "geom" from "points" where ST_intersects(?, ST_geomFromText(?, ?))',
        bindings: ['"geom"', '"geom"', '\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\'', 4326]
      });
  });

  it('select with intersects, field name is equals a type defined in WKT', function() {
    testsql(
      knex()
        .select('id', st.asText('point'))
        .from('points')
        .where(st.intersects('point', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326))),
      {
        sql: 'select "id", ST_asText(?) as "point" from "points" where ST_intersects(?, ST_geomFromText(?, ?))',
        bindings: ['"point"', '"point"', '\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\'', 4326]
      });
  });

  it('insert with geomFromText', function() {
    testsql(
      knex()
        .insert({
          'id': 1,
          'geom': st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
        bindings: ['\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\'', 4326, 1]
      });
  });

  it('insert with geomFromText Formato EWKT', function() {
    testsql(
      knex()
        .insert({
          'id': 1,
          'geom': st.geomFromText('SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))')
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
        bindings: ['\'Polygon((0 0, 0 1, 1 1, 1 0, 0 0))\'', 4326, 1]
      });
  });

  it('insert with geomFromGeoJSON text', function() {
    testsql(
      knex()
        .insert({
          'id': 1,
          'geom': st.geomFromGeoJSON('{"type":"Point","coordinates":[-48.23456,20.12345]}')
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(?), ?)',
        bindings: ['\'{"type":"Point","coordinates":[-48.23456,20.12345]}\'', 1]
      });
  });

  it('insert with geomFromGeoJSON object', function() {
    testsql(
      knex()
        .insert({
          'id': 1,
          'geom': st.geomFromGeoJSON({type:'Point', coordinates:[-48.23456, 20.12345]})
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(?), ?)',
        bindings: ['\'{"type":"Point","coordinates":[-48.23456,20.12345]}\'', 1]
      });
  });

  it('update a geometry column using geomFromGeoJSON text from another column', function() {
    testsql(
      knex()
        .update({
          'geom': st.geomFromGeoJSON('geoJsonColumn')
        })
        .table('points'),
      {
        sql: 'update "points" set "geom" = ST_geomFromGeoJSON(?)',
        bindings: ['"geoJsonColumn"']
      });
  });

  it('select with asGeoJSON', function() {
    testsql(knex().select('id', st.asGeoJSON('geom')).from('points'), {
      sql: 'select "id", ST_asGeoJSON(?) as "geom" from "points"',
      bindings: ['"geom"']
    });
  });

  it('allow spaces between WKT type and the first parenthesis', function() {
    testsql(
      knex()
        .insert({
          'id': 1,
          'geom': st.geomFromText('Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
        bindings: ['\'Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))\'', 4326, 1]
      });
  });

  it('prevent sql injection', function() {
    testsql(
      knex()
        .insert({
          id: 1,
          geom: st.geomFromText("Point(')); DROP TABLE points; SELECT concat(concat(')", 4326)
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
        bindings: ['"Point(\')); DROP TABLE points; SELECT concat(concat(\')"', 4326, 1]
      });

    expect(
      function() {
        return knex()
          .insert({
            id: 1,
            geom: st.geomFromGeoJSON({type: 'Point', coordinates: 'DROP TABLE points;'})
          })
          .into('points');
      }
    ).to.throw('Invalid GeoJSON');
  });

});

describe('Postgis extras', function() {

  it('define extra functions', function() {
    knex.postgisDefineExtras(function(knex, formatter) {
      return {
        utmzone: function(geom) {
          return knex.raw('utmzone(?)', formatter.wrapWKT(geom));
        }
      };
    });

    testsql(
      knex()
        .select('id', st.utmzone('point')
        .as('utm'))
        .from('points'),
      {
        sql: 'select "id", utmzone(?) as "utm" from "points"',
        bindings: ['"point"']
      }
    );

    testsql(
      knex()
        .select('id', st.utmzone(st.geomFromText('Point(0 0, 0 1)', 4326))
        .as('utm'))
        .from('points'),
      {
        sql: 'select "id", utmzone(ST_geomFromText(?, ?)) as "utm" from "points"',
        bindings: ['\'Point(0 0, 0 1)\'', 4326]
      }
    );
  });
});
