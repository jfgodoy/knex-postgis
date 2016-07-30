'use strict';

module.exports = function(knex, formatter, postgisFn) {
  var postgis = {

    x: function(geom) {
      return knex.postgisFn('ST_X', formatter.wrapWKT(geom));
    },

    y: function(geom) {
      return postgisFn('ST_Y', formatter.wrapWKT(geom));
    },

    area: function(geom) {
      return postgisFn('ST_area', formatter.wrapWKT(geom));
    },

    asText: function(col) {
      var raw = postgisFn('ST_asText', formatter.wrapWKT(col));
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    asEWKT: function(col) {
      var raw = postgisFn('ST_asEWKT', formatter.wrapWKT(col));
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    centroid: function(geom) {
      return postgisFn('ST_centroid', formatter.wrapWKT(geom));
    },

    intersection: function(geom1, geom2) {
      return postgisFn('ST_intersection',
        formatter.wrapWKT(geom1),
        formatter.wrapWKT(geom2)
      );
    },

    intersects: function(geom1, geom2) {
      return postgisFn('ST_intersects',
        formatter.wrapWKT(geom1),
        formatter.wrapWKT(geom2)
      );
    },

    geomFromText: function(geom, srid) {
      var regex = /srid=(\d+);(.*)/gi,
          match = regex.exec(geom);

      if (match) {
        srid = srid || +match[1];
        geom = match[2];
      }

      if (typeof srid === 'undefined') {
        return postgisFn('ST_geomFromText', formatter.wrapWKT(geom));
      } else {
        return postgisFn('ST_geomFromText', formatter.wrapWKT(geom), srid);
      }
    },

    transform: function(geom, srid) {
      return postgisFn('ST_transform', formatter.wrapWKT(geom), srid);
    },

    buffer: function(geom, radius) {
      return postgisFn('ST_Buffer', formatter.wrapWKT(geom), radius);
    },

    geography: function(geom) {
      return postgisFn('geography', formatter.wrapWKT(geom));
    },

    geometry: function(geography) {
      return postgisFn('geometry', formatter.wrapWKT(geography));
    },

    asGeoJSON: function(col) {
      var raw = postgisFn('ST_asGeoJSON', formatter.wrapWKT(col));
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    geomFromGeoJSON: function(geom) {
      return postgisFn('ST_geomFromGeoJSON', formatter.wrapGeoJSON(geom));
    },

    makeValid: function(geom) {
      return postgisFn('ST_MakeValid', formatter.wrapWKT(geom));
    },

    within: function(a, b) {
      return postgisFn('ST_Within', formatter.wrapWKT(a), formatter.wrapWKT(b));
    },

    dwithin: function(a, b, dist, spheroid) {
      if (spheroid) {
        return postgisFn('ST_DWithin',
          formatter.wrapWKT(a),
          formatter.wrapWKT(b),
          formatter.wrapNumber(dist),
          formatter.wrapBoolean(spheroid)
        );
      } else {
        return postgisFn('ST_DWithin',
          formatter.wrapWKT(a),
          formatter.wrapWKT(b),
          formatter.wrapNumber(dist)
        );
      }
    },

    makeEnvelope: function(minlon, minlat, maxlon, maxlat, srid) {
      if (typeof srid === 'undefined') {
        return postgisFn('ST_MakeEnvelope',
          formatter.wrapNumber(minlon),
          formatter.wrapNumber(minlat),
          formatter.wrapNumber(maxlon),
          formatter.wrapNumber(maxlat)
        );
      } else {
        return postgisFn('ST_MakeEnvelope',
          formatter.wrapNumber(minlon),
          formatter.wrapNumber(minlat),
          formatter.wrapNumber(maxlon),
          formatter.wrapNumber(maxlat),
          formatter.wrapNumber(srid)
        );
      }
    },

    makePoint: function(x, y, z, m) {
      if (typeof m === 'undefined') {
        if (typeof z === 'undefined') {
          return postgisFn('ST_MakePoint',
            formatter.wrapNumber(x),
            formatter.wrapNumber(y)
          );
        } else {
          return postgisFn('ST_MakePoint',
            formatter.wrapNumber(x),
            formatter.wrapNumber(y),
            formatter.wrapNumber(z)
          );
        }
      } else {
        return postgisFn('ST_MakePoint',
          formatter.wrapNumber(x),
          formatter.wrapNumber(y),
          formatter.wrapNumber(z),
          formatter.wrapNumber(m)
        );
      }
    },

    point: function(x, y) {
      return postgisFn('ST_Point', x, y);
    }
  };

  return postgis;
};
