'use strict';

var utils = require('./utils');

module.exports = function(knex) {
  var formatter, formatterProto;

  var rawProto = Object.getPrototypeOf(knex.raw());
  var rawConstructor = rawProto.constructor;


  formatterProto = knex.client.Formatter.prototype;

  formatterProto.wrapWKT = function wrapWKT(value) {
    if (value instanceof rawConstructor) {
      return value;
    }

    if (typeof value === 'string' && utils.isWKT(value)) {
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

  formatterProto.wrapNumber = function wrapNumber(value) {
    if (value instanceof rawConstructor) {
      return value;
    }

    if (utils.isNumber(value)) {
      return value;
    } else if (utils.isString(value)) {
      // If this is a string, it may refer to a field name which is kosher
      return knex.raw(this.wrap(value), []);
    } else {
      throw new Error('Invalid number provided');
    }
  };

  formatterProto.wrapBoolean = function wrapBoolean(value) {
    if (value instanceof rawConstructor) {
      return value;
    }

    if (utils.isBoolean(value)) {
      return value;
    } else if (utils.isString(value)) {
      // If this is a string, it may refer to a field name which is kosher
      return knex.raw(this.wrap(value), []);
    } else {
      throw new Error('Invalid boolean provided');
    }
  };


  function postgisFn(name) {
    var args = Array.prototype.slice.call(arguments);
    // remove name from the argument list
    args.shift();

    // last undefined arguments are considered opcional params.
    // here they are removed to avoid creating placeholders for them
    while (typeof args[args.length - 1] === 'undefined') {
      args.pop();
    }

    var placeholders = args.map(function() {return '?';}).join(', ');
    var sql = name + '(' + placeholders + ')';
    var raw = knex.raw(sql, args);

    return raw;
  }



  // attach postgis functions
  formatter = new knex.client.Formatter(knex.client);
  knex.postgis = require('./functions')(knex, formatter, postgisFn);

  knex.postgisDefineExtras = function(fnBuilder) {
    var fns = fnBuilder(knex, formatter, postgisFn);
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
