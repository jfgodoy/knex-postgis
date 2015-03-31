'use strict';

var geojsonhint = require('geojsonhint');

var geoJSONType = /^((Multi)?Point|LineString|Polygon)$/;

function normalizeGeoJsonGeometry(geom) {
  if (!geom || !geom.type || !Array.isArray(geom.coordinates)) {
    return null;
  }

  if (!geom.type.match(geoJSONType)) {
    console.error('Invalid geometry type', geoJSONType);
    return null;
  }

  var errors = geojsonhint.hint(geom);
  if (errors.length > 0) {
    var err = new Error('Invalid geometry given');
    err.errors = errors;
    throw err;
  }

  var result = {
    type: geom.type,
    coordinates: geom.coordinates
  };
  
  // add crs to result if available
  if (geom.crs) {
    result.crs = geom.crs;
  }
  
  return result;
}

exports.normalizeGeoJsonGeometry = normalizeGeoJsonGeometry;
