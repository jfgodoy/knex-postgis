'use strict';

var chai = require('chai'),
    tester = require('./tester'),
    expect = chai.expect,
    knex = tester.knex,
    st = knex.postgis,
    queryBuilder = tester.queryBuilder,
    testSql = tester.testSql;



describe('asEWKT', function() {
  it('can get geometry as EWKT from a geometry column', function() {
    var query = queryBuilder().select('id', st.asEWKT('geom')).from('points');
    var expected = {
      sql: 'select "id", ST_asEWKT("geom") as "geom" from "points"',
      bindings: []
    };

    testSql(query, expected);
  });
});


describe('asGeoJSON', function() {
  it('can get geometry as asGeoJSON from a geometry column', function() {
    var query, expected;

    query = queryBuilder().select('id', st.asGeoJSON('geom')).from('points');
    expected = {
      sql: 'select "id", ST_asGeoJSON("geom") as "geom" from "points"',
      bindings: []
    };

    testSql(query, expected);
  });
});


describe('asText', function() {
  it('can get geometry as text from a geometry column', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.asText('geom'))
      .from('points');

    expected = {
      sql: 'select "id", ST_asText("geom") as "geom" from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it('can get geometry as text from a geometry created with other postgis functions', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.asText(st.centroid('geom')).as('centroid'))
      .from('points');

    expected = {
      sql: 'select "id", ST_asText(ST_centroid("geom")) as "centroid" from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it('alias the result if the input is a column', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.asText('geom'))
      .from('points');

    expected = {
      sql: 'select "id", ST_asText("geom") as "geom" from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it('alias the result to a custom name', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.asText('geom').as('foo'))
      .from('points');

    expected = {
      sql: 'select "id", ST_asText("geom") as "foo" from "points"',
      bindings: []
    };

    testSql(query, expected);
  });
});

describe('buffer', function() {
  it('works with a column name and a number', function() {
    var query, expected;

    query = queryBuilder().select(st.buffer('geom', 1000));
    expected = {
      sql: 'select ST_Buffer("geom", ?)',
      bindings: [1000]
    };

    testSql(query, expected);
  });

  it('works with a radius from a column name', function() {
    var query, expected;

    query = queryBuilder().select(st.buffer('geom', 'radius'));
    expected = {
      sql: 'select ST_Buffer("geom", "radius")',
      bindings: []
    };

    testSql(query, expected);
  });
});

describe('centroid', function() {
  it('can get the centroid of a geometry column', function() {
    var query, expected;

    query = queryBuilder().select('id', st.centroid('geom')).from('points');
    expected = {
      sql: 'select "id", ST_centroid("geom") from "points"',
      bindings: []
    };

    testSql(query, expected);
  });
});


describe('DWithin', function() {
  it('works correctly with geometry columns', function() {
    var query, expected;

    query = queryBuilder().select(st.dwithin('a', 'b', 12));
    expected = {
      sql: 'select ST_DWithin("a", "b", ?)',
      bindings: [12]
    };

    testSql(query, expected);
  });

  it('works with a column name as the distance', function() {
    var query, expected;

    query = queryBuilder().select(st.dwithin('a', 'b', 'distanceColumn'));
    expected = {
      sql: 'select ST_DWithin("a", "b", "distanceColumn")',
      bindings: []
    };

    testSql(query, expected);
  });

  it('works with a created geometry', function() {
    var query, expected;

    query = queryBuilder().select(st.dwithin('a', st.point(-48.23456, 20.12345), 12));
    expected = {
      sql: 'select ST_DWithin("a", ST_Point(?, ?), ?)',
      bindings: [-48.23456, 20.12345, 12]
    };

    testSql(query, expected);
  });

  it('works as expected with spheroid argument', function() {
    var query, expected;

    query = queryBuilder().select(st.dwithin('a', 'b', 12, true));
    expected = {
      sql: 'select ST_DWithin("a", "b", ?, ?)',
      bindings: [12, true]
    };

    testSql(query, expected);
  });

  it('throws an error with invalid boolean spheroid argument', function() {
    expect(
      function() {
        return queryBuilder().select(st.dwithin('a', 'b', 12, []));
      }
    ).to.throw('Invalid boolean provided');
  });
});


describe('geomFromGeoJSON', function() {
  it('can create a geometry from a json text', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geom': st.geomFromGeoJSON('{"type":"Point","coordinates":[-48.23456,20.12345]}')
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(?), ?)',
      bindings: ['{"type":"Point","coordinates":[-48.23456,20.12345]}', 1]
    };

    testSql(query, expected);
  });


  it('can create a geometry collection from a json text', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geom': st.geomFromGeoJSON('{ "type": "GeometryCollection", "geometries": [ { "type": "Point", "coordinates": [100.0, 0.0] }, { "type": "LineString", "coordinates": [ [101.0, 0.0], [102.0, 1.0] ] } ] }')
      })
      .into('geometries');

    expected = {
      sql: 'insert into "geometries" ("geom", "id") values (ST_geomFromGeoJSON(?), ?)',
      bindings: ['{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[100,0]},{"type":"LineString","coordinates":[[101,0],[102,1]]}]}', 1]
    };

    testSql(query, expected);
  });

  it('can create a geometry from a json object', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geom': st.geomFromGeoJSON({type:'Point', coordinates:[-48.23456, 20.12345]})
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geom", "id") values (ST_geomFromGeoJSON(?), ?)',
      bindings: ['{"type":"Point","coordinates":[-48.23456,20.12345]}', 1]
    };

    testSql(query, expected);
  });

  it('can create a geometry from a column name', function() {
    testSql(
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

  it('prevents sql injection', function() {
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


describe('geomFromText', function() {
  it('can create a geometry from a WKT text', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geom': st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
      bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326, 1]
    };

    testSql(query, expected);
  });

  it('allows srid from a column', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geom': st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 'srid')
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, "srid"), ?)',
      bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 1]
    };

    testSql(query, expected);
  });


  it('can create a geometry from a EWKT text', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geom': st.geomFromText('SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))')
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?), ?)',
      bindings: ['SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 1]
    };

    testSql(query, expected);
  });

  it('allows spaces between WKT type and the first parenthesis', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geom': st.geomFromText('Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geom", "id") values (ST_geomFromText(?, ?), ?)',
      bindings: ['Polygon ((0 0, 0 1, 1 1, 1 0, 0 0))', 4326, 1]
    };

    testSql(query, expected);
  });


  it('correctly identify as a column, an input that are equal to a WKT type', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.asText('point'))
      .from('points')
      .where(st.intersects('point', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)));

    expected = {
      sql: 'select "id", ST_asText("point") as "point" from "points" where ST_intersects("point", ST_geomFromText(?, ?))',
      bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326]
    };

    testSql(query, expected);
  });

  it('prevents sql injection', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        id: 1,
        geom: st.geomFromText("Point(')); DROP TABLE points; SELECT concat(concat(')", 4326)
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geom", "id") values (ST_geomFromText("Point(\')); DROP TABLE points; SELECT concat(concat(\')", ?), ?)',
      bindings: [4326, 1]
    };

    testSql(query, expected);
  });
});


describe('intersects', function() {
  it('can intersects two geometry columns', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.intersects('geom1', 'geom2'))
      .from('points');

    expected = {
      sql: 'select "id", ST_intersects("geom1", "geom2") from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it('can intersects a geometry column with a geometry created with EWKT', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.asText('geom'))
      .from('points')
      .where(st.intersects('geom', 'SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))'));

    expected = {
      sql: 'select "id", ST_asText("geom") as "geom" from "points" where ST_intersects("geom", ?)',
      bindings: ['SRID=4326;Polygon((0 0, 0 1, 1 1, 1 0, 0 0))']
    };

    testSql(query, expected);
  });

  it('can intersects a geometry column with a geometry created with others postgis functions', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.asText('geom'))
      .from('points')
      .where(st.intersects('geom', st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326)));


    expected = {
      sql: 'select "id", ST_asText("geom") as "geom" from "points" where ST_intersects("geom", ST_geomFromText(?, ?))',
      bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326]
    };

    testSql(query, expected);
  });
});


describe('makeEnvelope', function() {
  it('can make an envelope', function() {
    var query, expected;

    query = queryBuilder()
      .select(st.makeEnvelope(-48.25456, 20.02345, -48.21456, 20.62345));

    expected = {
      sql: 'select ST_MakeEnvelope(?, ?, ?, ?)',
      bindings: [-48.25456, 20.02345, -48.21456, 20.62345]
    };

    testSql(query, expected);
  });

  it('can make an envelope with a specified srid', function() {
    var query, expected;

    query = queryBuilder()
      .select(st.makeEnvelope(-48.25456, 20.02345, -48.21456, 20.62345, 4326));

    expected = {
      sql: 'select ST_MakeEnvelope(?, ?, ?, ?, ?)',
      bindings: [-48.25456, 20.02345, -48.21456, 20.62345, 4326]
    };

    testSql(query, expected);
  });

  it('throws an error if provided a non-number min-latitude', function() {
    expect(
      function() {
        return queryBuilder()
          .select(st.makeEnvelope(-48.25456, null, -48.21456, 20.62345));
      }
    ).to.throw('Invalid number provided');
  });

  it('throws an error if provided a non-number max-longitude', function() {
    expect(
      function() {
        return queryBuilder()
          .select(st.makeEnvelope(-48.25456, 20.02345, {}, 20.62345));
      }
    ).to.throw('Invalid number provided');
  });

  it('throws an error if provided a non-number srid', function() {
    expect(
      function() {
        return queryBuilder()
          .select(st.makeEnvelope(-48.25456, 20.02345, -48.21456, 20.62345, []));
      }
    ).to.throw('Invalid number provided');
  });
});


describe('makePoint', function() {
  it('can make a point', function() {
    var query, expected;

    query = queryBuilder().select(st.makePoint(-48.23456, 20.12345));
    expected = {
      sql: 'select ST_MakePoint(?, ?)',
      bindings: [-48.23456, 20.12345]
    };

    testSql(query, expected);
  });

  it('can make a point with a height', function() {
    var query, expected;

    query = queryBuilder().select(st.makePoint(-48.23456, 20.12345, 1.5));
    expected = {
      sql: 'select ST_MakePoint(?, ?, ?)',
      bindings: [-48.23456, 20.12345, 1.5]
    };

    testSql(query, expected);
  });

  it('can make a point with a height and measure', function() {
    var query, expected;

    query = queryBuilder().select(st.makePoint(-48.23456, 20.12345, 1.5, 2.5));
    expected = {
      sql: 'select ST_MakePoint(?, ?, ?, ?)',
      bindings: [-48.23456, 20.12345, 1.5, 2.5]
    };

    testSql(query, expected);
  });

  it('throws an error if provided a non-number longitude', function() {
    expect(
      function() {
        return queryBuilder()
          .select(st.makePoint(false, 20.12345));
      }
    ).to.throw('Invalid number provided');
  });

  it('throws an error if provided a non-number latitude', function() {
    expect(
      function() {
        return queryBuilder()
          .select(st.makePoint(-48.23456, {test: true}));
      }
    ).to.throw('Invalid number provided');
  });

  it('does not throw an error if provided a number-y string latitude', function() {
    var query, expected;

    query = queryBuilder().select(st.makePoint(-48.23456, '20.12345'));
    expected = {
      sql: 'select ST_MakePoint(?, ?)',
      bindings: [-48.23456, '20.12345']
    };

    testSql(query, expected);

    expect(
      function() {
        return queryBuilder()
          .select(st.makePoint(-48.23456, '20.12345'));
      }
    ).to.not.throw('Invalid number provided');

  });
});


describe('makeValid', function() {
  it('can convert a geometry column', function() {
    testSql(queryBuilder().select('id', st.makeValid('geom')).from('points'), {
      sql: 'select "id", ST_MakeValid("geom") from "points"',
      bindings: []
    });
  });
});


describe('point', function() {
  it('can make a point', function() {
    var query, expected;

    query = queryBuilder().select(st.point(-48.23456, 20.12345));
    expected = {
      sql: 'select ST_Point(?, ?)',
      bindings: [-48.23456, 20.12345]
    };

    testSql(query, expected);
  });

  it('can make a point using column values', function() {
    var query, expected;

    query = queryBuilder().select(st.point('x', 'y'));
    expected = {
      sql: 'select ST_Point("x", "y")',
      bindings: []
    };

    testSql(query, expected);
  });
});

describe('transform', function() {
  it('works with a column name and a number', function() {
    var query, expected;

    query = queryBuilder().select(st.transform('geom', 4326));
    expected = {
      sql: 'select ST_transform("geom", ?::int)',
      bindings: [4326]
    };

    testSql(query, expected);
  });

  it('works with a srid from a column name', function() {
    var query, expected;

    query = queryBuilder().select(st.transform('geom', 'srid'));
    expected = {
      sql: 'select ST_transform("geom", "srid")',
      bindings: []
    };

    testSql(query, expected);
  });
});

describe('within', function() {
  it('works as expected', function() {
    var query, expected;

    query = queryBuilder().select(st.within('a', 'b'));
    expected = {
      sql: 'select ST_Within("a", "b")',
      bindings: []
    };

    testSql(query, expected);
  });

  it('works with a created geometry', function() {
    var query, expected;

    query = queryBuilder().select(st.within('a', st.point(-48.23456, 20.12345)));
    expected = {
      sql: 'select ST_Within("a", ST_Point(?, ?))',
      bindings: [-48.23456, 20.12345]
    };

    testSql(query, expected);
  });
});


describe('x', function() {
  it('can get x coordinate from a geometry column', function() {
    var query = queryBuilder().select(st.x('geom')).from('points');
    var expected = {
      sql: 'select ST_X("geom") from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it ('can get x coordinate from a wkt geometry', function() {
    var query = queryBuilder().select(st.x('POINT(1 1)')).from('points');
    var expected = {
      sql: 'select ST_X(?) from "points"',
      bindings: ['POINT(1 1)']
    };

    testSql(query, expected);
  });
});


describe('y', function() {
  it('can get y coordinate from a geometry column', function() {
    var query = queryBuilder().select(st.y('geom')).from('points');
    var expected = {
      sql: 'select ST_Y("geom") from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it ('can get y coordinate from a wkt geometry', function() {
    var query = queryBuilder().select(st.y('POINT(1 1)')).from('points');
    var expected = {
      sql: 'select ST_Y(?) from "points"',
      bindings: ['POINT(1 1)']
    };

    testSql(query, expected);
  });
});

describe('z', function() {
  it('can get z coordinate from a geometry column', function() {
    var query = queryBuilder().select(st.z('geom')).from('points');
    var expected = {
      sql: 'select ST_Z("geom") from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it ('can get z coordinate from a wkt geometry', function() {
    var query = queryBuilder().select(st.z('POINT(1 2 3 4)')).from('points');
    var expected = {
      sql: 'select ST_Z(?) from "points"',
      bindings: ['POINT(1 2 3 4)']
    };

    testSql(query, expected);
  });
});

describe('m', function() {
  it('can get m coordinate from a geometry column', function() {
    var query = queryBuilder().select(st.m('geom')).from('points');
    var expected = {
      sql: 'select ST_M("geom") from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it ('can get m coordinate from a wkt geometry', function() {
    var query = queryBuilder().select(st.m('POINT(1 2 3 4)')).from('points');
    var expected = {
      sql: 'select ST_M(?) from "points"',
      bindings: ['POINT(1 2 3 4)']
    };

    testSql(query, expected);
  });
});

describe('distance', function() {
  it('works as expected', function() {
    var query, expected;

    query = queryBuilder().select(st.distance('a', 'b'));
    expected = {
      sql: 'select ST_Distance("a", "b")',
      bindings: []
    };

    testSql(query, expected);
  });

  it('works with a created geometry', function() {
    var query, expected;

    query = queryBuilder().select(st.distance('a', st.point(-48.23456, 20.12345)));
    expected = {
      sql: 'select ST_Distance("a", ST_Point(?, ?))',
      bindings: [-48.23456, 20.12345]
    };

    testSql(query, expected);
  });
});

describe('distanceSphere', function() {
  it('works as expected', function() {
    var query, expected;

    query = queryBuilder().select(st.distanceSphere('a', 'b'));
    expected = {
      sql: 'select ST_DistanceSphere("a", "b")',
      bindings: []
    };

    testSql(query, expected);
  });

  it('works with a created geometry', function() {
    var query, expected;

    query = queryBuilder().select(st.distanceSphere('a', st.point(-48.23456, 20.12345)));
    expected = {
      sql: 'select ST_DistanceSphere("a", ST_Point(?, ?))',
      bindings: [-48.23456, 20.12345]
    };

    testSql(query, expected);
  });
});

describe('boundingBoxIntersects', function() {
  it ('works with two columns', function() {
    var query, expected;

    query = queryBuilder().select(st.boundingBoxIntersects('a', 'b').as('intersects'));
    expected = {
      sql: 'select "a" && "b" as "intersects"',
      bindings: []
    };

    testSql(query, expected);
  });

  it ('works with other functions', function() {
    var query, expected;

    query = queryBuilder().select(st.boundingBoxIntersects('a', st.buffer('b', 100)).as('intersects'));
    expected = {
      sql: 'select "a" && ST_Buffer("b", ?) as "intersects"',
      bindings: [100]
    };

    testSql(query, expected);
  });
});

describe('boundingBoxContained', function() {
  it ('works with two columns', function() {
    var query, expected;

    query = queryBuilder().select(st.boundingBoxContained('a', 'b').as('contained'));
    expected = {
      sql: 'select "a" @ "b" as "contained"',
      bindings: []
    };

    testSql(query, expected);
  });

  it ('works with other functions', function() {
    var query, expected;

    query = queryBuilder().select(st.boundingBoxContained('a', st.buffer('b', 100)).as('contained'));
    expected = {
      sql: 'select "a" @ ST_Buffer("b", ?) as "contained"',
      bindings: [100]
    };

    testSql(query, expected);
  });
});

describe('boundingBoxContains', function() {
  it ('works with two columns', function() {
    var query, expected;

    query = queryBuilder().select(st.boundingBoxContains('a', 'b').as('contains'));
    expected = {
      sql: 'select "a" ~ "b" as "contains"',
      bindings: []
    };

    testSql(query, expected);
  });

  it ('works with other functions', function() {
    var query, expected;

    query = queryBuilder().select(st.boundingBoxContains('a', st.buffer('b', 100)).as('contains'));
    expected = {
      sql: 'select "a" ~ ST_Buffer("b", ?) as "contains"',
      bindings: [100]
    };

    testSql(query, expected);
  });
});

describe('setSRID', function() {
  it('works as expected', function() {
    var query, expected;

    query = queryBuilder().select(st.setSRID('a', 4326));
    expected = {
      sql: 'select ST_SetSRID("a", ?)',
      bindings: [4326]
    };

    testSql(query, expected);
  });

  it('works with a created geometry', function() {
    var query, expected;

    query = queryBuilder().select(st.setSRID(st.point(-48.23456, 20.12345), 4326));
    expected = {
      sql: 'select ST_SetSRID(ST_Point(?, ?), ?)',
      bindings: [-48.23456, 20.12345, 4326]
    };

    testSql(query, expected);
  });
});

describe('geographyFromText', function() {
  it('can create a geography from a WKT text', function() {
    var query, expected;

    query = queryBuilder()
      .insert({
        'id': 1,
        'geog': st.geographyFromText('POINT(-118.4079 33.9434)')
      })
      .into('points');

    expected = {
      sql: 'insert into "points" ("geog", "id") values (ST_GeographyFromText(?), ?)',
      bindings: ['POINT(-118.4079 33.9434)', 1]
    };

    testSql(query, expected);
  });
});

describe('multi', function() {
  it('works as expected', function() {
    var query, expected;

    query = queryBuilder().select(st.asText(st.multi(st.geomFromText('Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326))));
    expected = {
      sql: `select ST_asText(ST_Multi(ST_geomFromText(?, ?)))`,
      bindings: ['Polygon((0 0, 0 1, 1 1, 1 0, 0 0))', 4326]
    };

    testSql(query, expected);
  });
});
