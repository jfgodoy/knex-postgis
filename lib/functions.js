'use strict';

module.exports = function(knex, formatter) {
  var postgis = {

    x: function(geom) {
      return knex.raw('ST_X(?)', [formatter.wrapWKT(geom)]);
    },

    y: function(geom) {
      return knex.raw('ST_Y(?)', [formatter.wrapWKT(geom)]);
    },

    area: function(geom) {
      return knex.raw('ST_area(?)', [formatter.wrapWKT(geom)]);
    },

    asText: function(col) {
      var raw = knex.raw('ST_asText(?)', [formatter.wrapWKT(col)]);
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    asEWKT: function(col) {
      var raw = knex.raw('ST_asEWKT(?)', [formatter.wrapWKT(col)]);
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    centroid: function(geom) {
      return knex.raw('ST_centroid(?)', [formatter.wrapWKT(geom)]);
    },

    intersection: function(geom1, geom2) {
      return knex.raw('ST_intersection(?, ?)', [
        formatter.wrapWKT(geom1),
        formatter.wrapWKT(geom2)
      ]);
    },

    intersects: function(geom1, geom2) {
      return knex.raw('ST_intersects(?, ?)', [
        formatter.wrapWKT(geom1),
        formatter.wrapWKT(geom2)
      ]);
    },

    geomFromText: function(geom, srid) {
      var regex = /srid=(\d+);(.*)/gi,
        match = regex.exec(geom);

      if (match) {
        srid = srid || +match[1];
        geom = match[2];
      }

      if (typeof srid === 'undefined') {
        return knex.raw('ST_geomFromText(?)', [formatter.wrapWKT(geom)]);
      } else {
        return knex.raw('ST_geomFromText(?, ?)', [formatter.wrapWKT(geom), srid]);
      }
    },

    transform: function(geom, srid) {
      return knex.raw('ST_transform(?, ?)', [formatter.wrapWKT(geom), srid]);
    },

    buffer: function(geom, radius) {
      return knex.raw('ST_Buffer(?, ?)', [formatter.wrapWKT(geom), radius]);
    },

    geography: function(geom) {
      return knex.raw('geography(?)', [formatter.wrapWKT(geom)]);
    },

    geometry: function(geography) {
      return knex.raw('geometry(?)', [formatter.wrapWKT(geography)]);
    },

    asGeoJSON: function(col) {
      var raw = knex.raw('ST_asGeoJSON(?)', [formatter.wrapWKT(col)]);
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    geomFromGeoJSON: function(geom) {
      return knex.raw('ST_geomFromGeoJSON(?)', [formatter.wrapGeoJSON(geom)]);
    },

    makeValid: function(geom) {
      return knex.raw('ST_MakeValid(?)', [formatter.wrapWKT(geom)]);
    },

    within: function(a, b) {
      return knex.raw('ST_Within(?, ?)', [a, b]);
    },

    dwithin: function(a, b, dist, spheroid) {
      if (typeof spheroid === 'boolean') {
        return knex.raw('ST_DWithin(?, ?, ?, ?)', [a, b, formatter.wrapNumber(dist), spheroid]);
      } else {
        return knex.raw('ST_DWithin(?, ?, ?)', [a, b, formatter.wrapNumber(dist)]);
      }
    },

    makeEnvelope: function(minlon, minlat, maxlon, maxlat, srid) {
      if (typeof srid === 'undefined') {
        return knex.raw('ST_MakeEnvelope(?, ?, ?, ?)', [
          formatter.wrapNumber(minlon),
          formatter.wrapNumber(minlat),
          formatter.wrapNumber(maxlon),
          formatter.wrapNumber(maxlat)
        ]);
      } else {
        return knex.raw('ST_MakeEnvelope(?, ?, ?, ?, ?)', [
          formatter.wrapNumber(minlon),
          formatter.wrapNumber(minlat),
          formatter.wrapNumber(maxlon),
          formatter.wrapNumber(maxlat),
          formatter.wrapNumber(srid)
        ]);
      }
    },

    makePoint: function(x, y, z, m) {
      if (typeof m === 'undefined') {
        if (typeof z === 'undefined') {
          return knex.raw('ST_MakePoint(?, ?)', [
            formatter.wrapNumber(x),
            formatter.wrapNumber(y)
          ]);
        } else {
          return knex.raw('ST_MakePoint(?, ?, ?)', [
            formatter.wrapNumber(x),
            formatter.wrapNumber(y),
            formatter.wrapNumber(z)
          ]);
        }
      } else {
        return knex.raw('ST_MakePoint(?, ?, ?, ?)', [
          formatter.wrapNumber(x),
          formatter.wrapNumber(y),
          formatter.wrapNumber(z),
          formatter.wrapNumber(m)
        ]);
      }
    },

    point: function(x, y) {
      return knex.raw('ST_Point(?, ?)', [x, y]);
    }
  };

  return postgis;
};
