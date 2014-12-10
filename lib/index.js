'use strict';

module.exports = function(knex) {
  var formatter, formatterProto, wktRegex;

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
  ].join('|') + ')\\(.*\\)', 'i');

  formatterProto = knex.client.Formatter.prototype;

  formatterProto.wrapWKT = function wrapWKT(value) {
    if (typeof value === 'string' && value.match(wktRegex)) {
      return '\'' + value + '\'';
    } else {
      return this.wrap(value);
    }
  };

  // attach postgis functions
  formatter = new knex.client.Formatter();
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
  var rawProto = Object.getPrototypeOf(knex.raw());
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
