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
  };

  return postgis;
};
