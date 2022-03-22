'use strict';

var checkGeojson = require('@placemarkio/check-geojson');

var wktRegex = new RegExp('^(srid=\\d+;)?(' + [
  'geometry(collection)?',
  'curvepolygon',
  '((multi)?(point|polygon|curve|surface|linestring))',
  'triangle',
  'circularstring',
  'CompoundCurve',
  'PolyhedralSurface',
  'TIN'
].join('|') + ')\\s*\\([0-9,\\s.()+-]*\\)', 'i');

function checkGeoJsonGeometry(geomStr) {
  try {
    var geom = checkGeojson.check(geomStr);
    var result;

    if (geom.type === 'GeometryCollection') {
      result = {
        type: geom.type,
        geometries: geom.geometries
      };
    } else {
      result = {
        type: geom.type,
        coordinates: geom.coordinates
      };
    }

    // add crs to result if available
    if (geom.crs) {
      result.crs = geom.crs;
    }
    return result;
  } catch (e) {
    var err = new Error('Invalid GeoJSON');
    err.errors = e.issues;
    throw err;
  }
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
  return wktRegex.test(value);
}

exports.isBoolean = isBoolean;
exports.isNumber = isNumber;
exports.isString = isString;
exports.isWKT = isWKT;
exports.checkGeoJsonGeometry = checkGeoJsonGeometry;
