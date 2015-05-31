'use strict';

var utils = require('./utils');

module.exports = function(knex) {
  var formatter, formatterProto, wktRegex;

  var rawProto = Object.getPrototypeOf(knex.raw());
  var rawConstructor = rawProto.constructor;

  // extend knex formatter with wrapWKT function

  wktRegex = new RegExp('^(srid=\\d+;)?(' + [
    'geometry(collection)?',
    'curvepolygon',
    '((multi)?point|polygon|curve|surface|linestring)',
    'triangle',
    'circularstring',
    'CompoundCurve',
    'PolyhedralSurface',
    'TIN'
  ].join('|') + ')\\s*\\([0-9,\s\.\(\) \+-]*\\)', 'i');

  formatterProto = knex.client.Formatter.prototype;

  formatterProto.wrapWKT = function wrapWKT(value) {
    if (value instanceof rawConstructor) {
      return value;
    }

    if (typeof value === 'string' && value.match(wktRegex)) {
      return value;
    } else {
      return knex.raw(this.wrap(value), []);
    }
  };

  formatterProto.wrapGeoJSON = function wrapGeoJSON(value) {
    var geom;

    if (value instanceof rawConstructor) {
      return value;
    }

    if (typeof value === 'object') {
      geom = value;
    } else {
      if (typeof value === 'string' && value.match(/^[^\{\}]*$/)) {
        return knex.raw(this.wrap(value), []);
      }
      try {
        geom = JSON.parse(value);
      } catch (err) {
        throw new Error('Invalid GeoJSON');
      }
    }

    return utils.normalizeGeoJsonGeometry(geom);
  };

  // attach postgis functions
  formatter = new knex.client.Formatter(knex.client);
  knex.postgis = require('./functions')(knex, formatter);

  knex.postgisDefineExtras = function(fnBuilder) {
    var fns = fnBuilder(knex, formatter);
    if (fns) {
      for (var fnName in fns) {
        knex.postgis[fnName] = fns[fnName];
      }
    }
  };

  // function to add alias to raw sql
  rawProto.as = function as(alias) {
    var idx;

    if (this.alias) {
      idx = this.sql.lastIndexOf(this.alias);
      if (idx >= 0) {
        this.sql = this.sql.substring(0, idx);
      }
    }

    this.alias = ' as ' + formatter.wrap(alias);
    this.sql = this.sql + this.alias;

    return this;
  };

  return knex.postgis;
};
