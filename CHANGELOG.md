# Changelog

## [ 0.14.3 ] - 2022-03-21
  - fix geomFromGeoJSON for type GeometryCollection

## [ 0.14.2 ] - 2022-03-09
  - avoid geojson validation issue (see https://github.com/placemark/check-geojson/issues/20) by using exact version 0.1.7

## [ 0.14.1 ] - 2021-07-05
  - fix typescript types

## [ 0.14.0 ] - 2021-07-03
  - replace deprecated dependency `@mapbox/geojsonhint` with `@placemarkio/check-geojson` from the same author. This dependency is used to validate geojson values, so the replacement has affected a bit that part. According to `check-geojson` documentation, there is no validation for excessive coordinate precision and right-hand rule compliance.
  - drop support for node 8, 9, 10.
  - add tests in travis for node 14 and 16

## [ 0.13.0 ] - 2021-02-26
  - add `multi` function

## [ 0.12.0 ] - 2020-04-27
  - add z and m functions
  - update devDependencies
  - add knex 0.21 to travis


## [ 0.11.0 ] - 2020-03-25
  - add function [ST_GeographyFromText](https://postgis.net/docs/ST_GeographyFromText.html)

## [ 0.10.0 ] - 2019-11-15
  - add basic support for typescript

## [ 0.9.0 ] - 2019-11-12
### Breaking Changes
  - drop support for node 6

### Changes
  - add new versions of knex and node to travis
  - update dependencies
  - update examples to avoid warnings with the latest knex
  - fix linter warnings

## [ 0.8.1 ] - 2019-07-03
  - fix result of `.toString()` in queries that use geoJSON. Now knex sends to pg the geom in string format instead of object.

## [ 0.8.0 ] - 2019-04-09
  - drop support for node 4
  - fix st_transform function to avoid srid be interpreted as string
  - update dependencies

## [ 0.7.0 ] - 2018-08-02
  - add support for [st_SetSRID](https://postgis.net/docs/ST_SetSRID.html)

## [ 0.6.0 ] - 2018-03-19
  - add support for [st_DistanceSphere](https://postgis.net/docs/ST_DistanceSphere.html)

## [ 0.5.0 ] - 2017-11-15
  - drop support for node 0.x
  - add knex@0.14, node 8 y node 9 to travis

## [ 0.4.0 ] - 2017-10-12
  - add support for [@](http://postgis.net/docs/manual-2.0/ST_Geometry_Contained.html) operator as `boundingBoxContained`
  - add support for [~](http://postgis.net/docs/manual-2.0/ST_Geometry_Contain.html) operator as `boundingBoxContains`
  - rename function `boundingBoxIntersection` to `boundingBoxIntersects`. The function `boundingBoxIntersection` will be removed in the next release.

## [ 0.3.0 ] - 2017-10-12
  - add support for [&&](http://postgis.net/docs/manual-2.0/geometry_overlaps.html) operator as `boundingBoxIntersection`

## [ 0.2.2 ] - 2017-04-09
  - update geojsonhint dependency to its new name (@davidfurlong)

## [ 0.2.1 ] - 2017-03-19
  - fix recognition of `multi*` WKTs (@johnhampton)

## [ 0.2.0 ] - 2016-09-15
  - (breaking change) Drop support for knex@0.7
  - add support for knex@0.12
