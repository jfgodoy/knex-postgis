'use strict';

module.exports = function(knex, formatter) {
  var postgis = {
    asText: function(col) {
      var raw = knex.raw('ST_asText(' + formatter.wrapWKT(col) + ')');
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    asEWKT: function(col) {
      var raw = knex.raw('ST_asEWKT(' + formatter.wrapWKT(col) + ')');
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    centroid: function(geom) {
      return knex.raw('ST_centroid(' + formatter.wrapWKT(geom) + ')');
    },

    intersects: function(geom1, geom2) {
      return knex.raw('ST_intersects(' +
        formatter.wrapWKT(geom1) + ', ' +
        formatter.wrapWKT(geom2) + ')');
    },

    geomFromText: function(geom, srid) {
      var regex = /(srid=\d+;)(.*)/gi,
        match = regex.exec(geom);

      if (match) {
        srid = srid || +match[1];
        geom = match[2];
      }

      if (typeof srid === 'undefined') {
        return knex.raw('ST_geomFromText(' + formatter.wrapWKT(geom) + ')');
      } else {
        return knex.raw('ST_geomFromText(' + formatter.wrapWKT(geom) + ', ' + formatter.wrap(srid) + ')');
      }
    }
  };

  return postgis;
};
