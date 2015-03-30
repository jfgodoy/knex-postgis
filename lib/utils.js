'use strict';

var geoJSONType = /^((Multi)?Point|LineString|Polygon)$/;

function _isPosition(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return false;
  }

  for (var i = 0, n = coordinates.length; i < n; i++) {
    if (typeof coordinates[i] !== 'number') {
      return false;
    }
  }

  return true;
}

function _validCoordinates(coordinates) {
  /* TODO: improve this validation using geometry type,
   * for now, this function only check that coordinates is an
   * array of arrays or numbers
   */

  if (_isPosition(coordinates)) {
    return true;
  }

  if (!Array.isArray(coordinates)) {
    return false;
  }

  // if isn't a position, all items must be arrays
  for (var i = 0, n = coordinates.length; i < n; i++) {
    if (!Array.isArray(coordinates[i])) {
      return false;
    }
    if (!_validCoordinates(coordinates)) {
      return false;
    }
  }
}

function normalizeGeoJsonGeometry(geom) {
  if (!geom || !geom.type || !Array.isArray(geom.coordinates)) {
    return null;
  }

  if (!geom.type.match(geoJSONType)) {
    return null;
  }

  if (!_validCoordinates(geom.coordinates)) {
    return null;
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
