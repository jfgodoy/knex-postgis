'use strict';

var knex = require('knex')({
  dialect: 'postgres'
});

// install postgis functions in knex.postgis;
var st = require('../lib/index')(knex);

// insert a point
var sql1 = knex.insert({
  id: 1,
  geom: st.geomFromText('Point(0 0)', 4326)
}).into('points').toString();
console.log(sql1);
// insert into "points" ("geom", "id") values (ST_geomFromText('Point(0 0)'), '1')

// find all points return point in wkt format
var sql2 = knex.select('id', st.asText('geom')).from('points').toString();
console.log(sql2);
// select "id", ST_asText("geom") as "geom" from "points"


// all methods support alias
var sql3 = knex.select('id', st.asText(st.centroid('geom')).as('centroid')).from('geometries').toString();
console.log(sql3);
// select "id", ST_asText(ST_centroid("geom")) as "centroid" from "geometries"

// insert a point from a geojson string
var sql4 = knex.insert({
  id: 1,
  geom: st.geomFromGeoJSON('{"type": "Point", "coordinates": [-48.23456,20.12345]}')
}).into('points').toString();
console.log(sql4);

// insert a point from a geojson object
var sql5 = knex.insert({
  id: 1,
  geom: st.geomFromGeoJSON({type: 'Point', coordinates: [-48.23456, 20.12345]})
}).into('points').toString();
console.log(sql5);
