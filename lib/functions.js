'use strict';

module.exports = function(knex, formatter, postgisFn) {
  var wrapWKT = formatter.wrapWKT,
      wrapGeoJSON = formatter.wrapGeoJSON,
      wrapNumber = formatter.wrapNumber,
      wrapBoolean = formatter.wrapBoolean,
      postgis;

  postgis = {

    x: function(geom) {
      return postgisFn('ST_X', wrapWKT(geom));
    },

    y: function(geom) {
      return postgisFn('ST_Y', wrapWKT(geom));
    },

    area: function(geom) {
      return postgisFn('ST_area', wrapWKT(geom));
    },

    asText: function(col) {
      var raw = postgisFn('ST_asText', wrapWKT(col));
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    asEWKT: function(col) {
      var raw = postgisFn('ST_asEWKT', wrapWKT(col));
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    centroid: function(geom) {
      return postgisFn('ST_centroid', wrapWKT(geom));
    },

    intersection: function(geom1, geom2) {
      return postgisFn('ST_intersection',
        wrapWKT(geom1),
        wrapWKT(geom2)
      );
    },

    intersects: function(geom1, geom2) {
      return postgisFn('ST_intersects',
        wrapWKT(geom1),
        wrapWKT(geom2)
      );
    },

    geomFromText: function(geom, srid) {
      if (typeof srid === 'undefined') {
        return postgisFn('ST_geomFromText', wrapWKT(geom));
      } else {
        return postgisFn('ST_geomFromText', wrapWKT(geom), wrapNumber(srid));
      }
    },

    transform: function(geom, srid) {
      return postgisFn('ST_transform', wrapWKT(geom), wrapNumber(srid));
    },

    buffer: function(geom, radius) {
      return postgisFn('ST_Buffer', wrapWKT(geom), wrapNumber(radius));
    },

    geography: function(geom) {
      return postgisFn('geography', wrapWKT(geom));
    },

    geometry: function(geography) {
      return postgisFn('geometry', wrapWKT(geography));
    },

    asGeoJSON: function(col) {
      var raw = postgisFn('ST_asGeoJSON', wrapWKT(col));
      if (typeof col === 'string') {
        raw.as(col);
      }
      return raw;
    },

    geomFromGeoJSON: function(geom) {
      return postgisFn('ST_geomFromGeoJSON', wrapGeoJSON(geom));
    },

    makeValid: function(geom) {
      return postgisFn('ST_MakeValid', wrapWKT(geom));
    },

    within: function(a, b) {
      return postgisFn('ST_Within', wrapWKT(a), wrapWKT(b));
    },

    distance: function(a, b) {
      return postgisFn('ST_Distance',
        wrapWKT(a),
        wrapWKT(b)
      );
    },

    dwithin: function(a, b, dist, spheroid) {
      if (spheroid) {
        return postgisFn('ST_DWithin',
          wrapWKT(a),
          wrapWKT(b),
          wrapNumber(dist),
          wrapBoolean(spheroid)
        );
      } else {
        return postgisFn('ST_DWithin',
          wrapWKT(a),
          wrapWKT(b),
          wrapNumber(dist)
        );
      }
    },

    makeEnvelope: function(minlon, minlat, maxlon, maxlat, srid) {
      if (typeof srid === 'undefined') {
        return postgisFn('ST_MakeEnvelope',
          wrapNumber(minlon),
          wrapNumber(minlat),
          wrapNumber(maxlon),
          wrapNumber(maxlat)
        );
      } else {
        return postgisFn('ST_MakeEnvelope',
          wrapNumber(minlon),
          wrapNumber(minlat),
          wrapNumber(maxlon),
          wrapNumber(maxlat),
          wrapNumber(srid)
        );
      }
    },

    makePoint: function(x, y, z, m) {
      if (typeof m === 'undefined') {
        if (typeof z === 'undefined') {
          return postgisFn('ST_MakePoint',
            wrapNumber(x),
            wrapNumber(y)
          );
        } else {
          return postgisFn('ST_MakePoint',
            wrapNumber(x),
            wrapNumber(y),
            wrapNumber(z)
          );
        }
      } else {
        return postgisFn('ST_MakePoint',
          wrapNumber(x),
          wrapNumber(y),
          wrapNumber(z),
          wrapNumber(m)
        );
      }
    },

    point: function(x, y) {
      return postgisFn('ST_Point', wrapNumber(x), wrapNumber(y));
    }
  };

  return postgis;
};
