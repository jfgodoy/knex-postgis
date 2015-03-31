'use strict';

var geojsonhint = require('geojsonhint');


function normalizeGeoJsonGeometry(geom) {

  var errors = geojsonhint.hint(geom);
  if (errors.length > 0) {
    var err = new Error('Invalid GeoJSON');
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
