'use strict';

/* globals describe, it */

var chai = require('chai'),
    expect = chai.expect;


var knex = require('knex')({
  dialect: 'postgres'
});

// install postgis extension and save a reference in st
var st = require('../lib/index.js')(knex);


function queryBuilder() {
  return knex.queryBuilder ? knex.queryBuilder() : knex();
}

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
      sql: 'ST_asText("geom") as "geom"',
      bindings: []
    });

    testsql(st.asText('geom').as('foo'), {
      sql: 'ST_asText("geom") as "foo"',
      bindings: []
    });
  });

  it('select with asText', function() {
    testsql(queryBuilder().select('id', st.asText('geom')).from('points'), {
      sql: 'select "id", ST_asText("geom") as "geom" from "points"',
      bindings: []
    });
  });

  it('select with asEWKT', function() {
    testsql(queryBuilder().select('id', st.asEWKT('geom')).from('points'), {
      sql: 'select "id", ST_asEWKT("geom") as "geom" from "points"',
      bindings: []
    });
  });

  it('select with centroid', function() {
    testsql(queryBuilder().select('id', st.centroid('geom')).from('points'), {
      sql: 'select "id", ST_centroid("geom") from "points"',
      bindings: []
    });
  });

  it('select with centroid and asText', function() {
    testsql(queryBuilder().select('id', st.asText(st.centroid('geom')).as('centroid')).from('points'), {
      sql: 'select "id", ST_asText(ST_centroid("geom")) as "centroid" from "points"',
      bindings: []
    });
  });

  it('select with intersects, argument in ewkt format', function() {
    testsql(
      queryBuilder()
        .select('id', st.asText('geom'))
        .from('points')
        .where(st.intersects('geom', 'SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))')),
      {
        sql: 'select "id", ST_asText("geom") as "geom" from "points" where ST_intersects("geom", ?)',
        bindings: ['SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))']
      });
  });

  it('select with intersects, argument using geomFromText function', function() {
    testsql(
      queryBuilder()
        .select('id', st.asText('geom'))
        .from('points')
        .where(st.intersects('geom', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326))),
      {
        sql: 'select "id", ST_asText("geom") as "geom" from "points" where ST_intersects("geom", ST_geomFromText(?, ?))',
        bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326]
      });
  });

  it('select with intersects, field name is equals to a type defined in WKT', function() {
    testsql(
      queryBuilder()
        .select('id', st.asText('point'))
        .from('points')
        .where(st.intersects('point', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326))),
      {
        sql: 'select "id", ST_asText("point") as "point" from "points" where ST_intersects("point", ST_geomFromText(?, ?))',
        bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326]
      });
  });

  it('insert with geomFromText', function() {
    testsql(
      queryBuilder()
        .insert({
          'id': 1,
          'geom': st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
        bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326, 1]
      });
  });

  it('insert with geomFromText Formato EWKT', function() {
    testsql(
      queryBuilder()
        .insert({
          'id': 1,
          'geom': st.geomFromText('SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))')
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
        bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326, 1]
      });
  });

  it('insert with geomFromGeoJSON text', function() {
    testsql(
      queryBuilder()
        .insert({
          'id': 1,
          'geom': st.geomFromGeoJSON('{"type":"Point","coordinates":[-48.23456,20.12345]}')
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(?), ?)',
        bindings: [{type:'Point', coordinates:[-48.23456, 20.12345]}, 1]
      });
  });

  it('insert with geomFromGeoJSON object', function() {
    testsql(
      queryBuilder()
        .insert({
          'id': 1,
          'geom': st.geomFromGeoJSON({type:'Point', coordinates:[-48.23456, 20.12345]})
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(?), ?)',
        bindings: [{type:'Point', coordinates:[-48.23456, 20.12345]}, 1]
      });
  });

  it('update a geometry column using geomFromGeoJSON text from another column', function() {
    testsql(
      queryBuilder()
        .update({
          'geom': st.geomFromGeoJSON('geoJsonColumn')
        })
        .table('points'),
      {
        sql: 'update "points" set "geom" = ST_geomFromGeoJSON("geoJsonColumn")',
        bindings: []
      });
  });

  it('select with asGeoJSON', function() {
    testsql(queryBuilder().select('id', st.asGeoJSON('geom')).from('points'), {
      sql: 'select "id", ST_asGeoJSON("geom") as "geom" from "points"',
      bindings: []
    });
  });

  it('select with makevalid', function() {
    testsql(queryBuilder().select('id', st.makeValid('geom')).from('points'), {
      sql: 'select "id", ST_MakeValid("geom") from "points"',
      bindings: []
    });
  });

  it('allow spaces between WKT type and the first parenthesis', function() {
    testsql(
      queryBuilder()
        .insert({
          'id': 1,
          'geom': st.geomFromText('Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
        bindings: ['Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))', 4326, 1]
      });
  });

  it('prevent sql injection', function() {
    testsql(
      queryBuilder()
        .insert({
          id: 1,
          geom: st.geomFromText("Point(')); DROP TABLE points; SELECT concat(concat(')", 4326)
        })
        .into('points'),
      {
        sql: 'insert into "points" ("geom", "id") values (ST_geomFromText("Point(\')); DROP TABLE points; SELECT concat(concat(\')", ?), ?)',
        bindings: [4326, 1]
      });

    expect(
      function() {
        return queryBuilder()
          .insert({
            id: 1,
            geom: st.geomFromGeoJSON({type: 'Point', coordinates: 'DROP TABLE points;'})
          })
          .into('points');
      }
    ).to.throw('Invalid GeoJSON');
  });

  it('prevent sql injection', function() {
    testsql(queryBuilder()
      .insert({
        id: 1,
        geom: st.geomFromText("Point(')); DROP TABLE points; SELECT concat(concat(')", 4326)
      })
      .into('points'),
      'insert into "points" ("geom", "id") values (ST_geomFromText("Point(\')); DROP TABLE points; SELECT concat(concat(\')", ?), ?)');

    expect(
      function() {
        return queryBuilder()
          .insert({
            id: 1,
            geom: st.geomFromGeoJSON({type: 'Point', coordinates: 'DROP TABLE points;'})
          })
          .into('points');
      }
    ).to.throw('Invalid GeoJSON');
  });

});

describe('Geometry Constructors', function() {
  describe('MakeEnvelope', function() {
    it('can make an envelope', function() {
      testsql(queryBuilder().select(st.makeEnvelope(-48.25456, 20.02345, -48.21456, 20.62345)), {
        sql: 'select ST_MakeEnvelope(?, ?, ?, ?)',
        bindings: [-48.25456, 20.02345, -48.21456, 20.62345]
      });
    });

    it('can make an envelope with a specified srid', function() {
      testsql(queryBuilder().select(st.makeEnvelope(-48.25456, 20.02345, -48.21456, 20.62345, 4326)), {
        sql: 'select ST_MakeEnvelope(?, ?, ?, ?, ?)',
        bindings: [-48.25456, 20.02345, -48.21456, 20.62345, 4326]
      });
    });
  });

  describe('MakePoint', function() {
    it('can make a point', function() {
      testsql(queryBuilder().select(st.makePoint(-48.23456, 20.12345)), {
        sql: 'select ST_MakePoint(?, ?)',
        bindings: [-48.23456, 20.12345]
      });
    });

    it('can make a point with a height', function() {
      testsql(queryBuilder().select(st.makePoint(-48.23456, 20.12345, 1.5)), {
        sql: 'select ST_MakePoint(?, ?, ?)',
        bindings: [-48.23456, 20.12345, 1.5]
      });
    });

    it('can make a point with a height and measure', function() {
      testsql(queryBuilder().select(st.makePoint(-48.23456, 20.12345, 1.5, 2.5)), {
        sql: 'select ST_MakePoint(?, ?, ?, ?)',
        bindings: [-48.23456, 20.12345, 1.5, 2.5]
      });
    });

    it('throws an error if provided a non-number longitude', function() {
      expect(
        function() {
          return queryBuilder().select(st.makePoint('banana', 20.12345));
        }
      ).to.throw('Invalid number provided');
    });

    it('throws an error if provided a non-number latitude', function() {
      expect(
        function() {
          return queryBuilder().select(st.makePoint(-48.23456, 'banana'));
        }
      ).to.throw('Invalid number provided');
    });

    it('does not throw an error if provided a number-y string latitude', function() {
      expect(
        function() {
          return queryBuilder().select(st.makePoint(-48.23456, '20.12345'));
        }
      ).to.not.throw('Invalid number provided');

      testsql(queryBuilder().select(st.makePoint(-48.23456, '20.12345')), {
        sql: 'select ST_MakePoint(?, ?)',
        bindings: [-48.23456, '20.12345']
      });
    });
  });

  describe('Point', function() {
    it('can make a point', function() {
      testsql(queryBuilder().select(st.point(-48.23456, 20.12345)), {
        sql: 'select ST_Point(?, ?)',
        bindings: [-48.23456, 20.12345]
      });
    });
  });
});

describe('Postgis extras', function() {

  it('define extra functions', function() {
    knex.postgisDefineExtras(function(knex, formatter) {
      return {
        utmzone: function(geom) {
          return knex.raw('utmzone(?)', [formatter.wrapWKT(geom)]);
        }
      };
    });

    testsql(
      queryBuilder()
        .select('id', st.utmzone('point')
        .as('utm'))
        .from('points'),
      {
        sql: 'select "id", utmzone("point") as "utm" from "points"',
        bindings: []
      }
    );

    testsql(
      queryBuilder()
        .select('id', st.utmzone(st.geomFromText('Point(0 0, 0 1)', 4326))
        .as('utm'))
        .from('points'),
      {
        sql: 'select "id", utmzone(ST_geomFromText(?, ?)) as "utm" from "points"',
        bindings: ['Point(0 0, 0 1)', 4326]
      }
    );
  });
});
