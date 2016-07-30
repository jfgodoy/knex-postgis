'use strict';

var geojsonhint = require('geojsonhint');

var wktRegex = new RegExp('^(srid=\\d+;)?(' + [
  'geometry(collection)?',
  'curvepolygon',
  '((multi)?point|polygon|curve|surface|linestring)',
  'triangle',
  'circularstring',
  'CompoundCurve',
  'PolyhedralSurface',
  'TIN'
].join('|') + ')\\s*\\([0-9,\s\.\(\) \+-]*\\)', 'i');

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

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isBoolean(b) {
  return typeof b === 'boolean';
}

function isString(s) {
  return typeof s === 'string';
}

function isWKT(value) {
  return value.match(wktRegex);
}

exports.isBoolean = isBoolean;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isWKT = isWKT;
exports.normalizeGeoJsonGeometry = normalizeGeoJsonGeometry;
