'use strict';

/* globals describe, it */
var tester = require('./tester'),
    knex = tester.knex,
    st = knex.postgis,
    queryBuilder = tester.queryBuilder,
    testSql = tester.testSql;



describe('Define extra functions', function() {

  knex.postgisDefineExtras(function(knex, formatter, postgisFn) {
    return {
      utmzone: function(geom) {
        return postgisFn('utmzone', formatter.wrapWKT(geom));
      }
    };
  });

  it('works correctly with a column name as input', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.utmzone('point').as('utm'))
      .from('points');

    expected = {
      sql: 'select "id", utmzone("point") as "utm" from "points"',
      bindings: []
    };

    testSql(query, expected);
  });

  it('works correctly with a geometry created with others postgis functions', function() {
    var query, expected;

    query = queryBuilder()
      .select('id', st.utmzone(st.geomFromText('Point(0 0, 0 1)', 4326)).as('utm'))
      .from('points');

    expected = {
      sql: 'select "id", utmzone(ST_geomFromText(?, ?)) as "utm" from "points"',
      bindings: ['Point(0 0, 0 1)', 4326]
    };

    testSql(query, expected);
  });

});
