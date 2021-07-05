import { Geometry } from 'geojson';
import { Knex } from 'knex';

type ColumnName = string | Knex.Raw | Knex.QueryBuilder;

interface ExtendedKnexRaw extends Knex.Raw {
  as(alias: string): ExtendedKnexRaw
}

declare function KnexPostgis(knex: Knex): KnexPostgis.KnexPostgis;

declare namespace KnexPostgis {
    interface KnexPostgis {
        /**
         * Returns the area of the surface if it is a Polygon or MultiPolygon. For geometry, a
         * 2D Cartesian area is determined with units specified by the SRID. For geography, area
         * is determined on a curved surface with units in square meters.
         *
         * @see {@link https://postgis.net/docs/ST_Area.html }
         */
        area(geom: ColumnName): ExtendedKnexRaw;

        /**
         * Return the Well-Known Text (WKT) representation of the geometry/geography without SRID metadata.
         *
         * @see {@link https://postgis.net/docs/ST_AsText.html }
         */
        asText(column: ColumnName): ExtendedKnexRaw;

        /**
         * Return the geometry as a GeoJSON element.
         *
         * @see {@link https://postgis.net/docs/ST_AsGeoJSON.html }
         */
        asGeoJSON(column: ColumnName): ExtendedKnexRaw;

        /**
         * Return the Well-Known Text (WKT) representation of the geometry with SRID meta data.
         *
         * @see {@link https://postgis.net/docs/ST_AsEWKT.html }
         */
        asEWKT(column: ColumnName): ExtendedKnexRaw;

        /**
         * Returns TRUE if A's 2D bounding box intersects B's 2D bounding box.
         *
         * @see {@link http://postgis.net/docs/manual-2.0/geometry_overlaps.html }
         */
        boundingBoxIntersects(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;

        /**
         * Returns TRUE if A's bounding box is contained by B's.
         *
         * @see {@link http://postgis.net/docs/manual-2.0/ST_Geometry_Contained.html }
         */
        boundingBoxContained(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;

        /**
         * Returns TRUE if A's bounding box contains B's.
         *
         * @see {@link http://postgis.net/docs/manual-2.0/ST_Geometry_Contain.html }
         */
        boundingBoxContains(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;

        /**
         * Returns a geometry covering all points within a given distance from the input geometry.
         *
         * @see {@link https://postgis.net/docs/ST_Buffer.html }
         */
        buffer(geom: ColumnName, radius: number): ExtendedKnexRaw;

        /**
         * Returns the geometric center of a geometry.
         *
         * @see {@link https://postgis.net/docs/ST_Centroid.html }
         */
        centroid(geom: ColumnName): ExtendedKnexRaw;

        /**
         * For geometry type Returns the 2D Cartesian distance between two geometries in projected
         * units (based on spatial ref). For geography type defaults to return minimum geodesic
         * distance between two geographies in meters.
         *
         * @see {@link https://postgis.net/docs/ST_Distance.html }
         */
        distance(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;


        /**
         * Returns linear distance in meters between two lon/lat points. Uses a spherical earth
         * and radius of 6370986 meters. Faster than ST_Distance_Spheroid, but less accurate.
         * Only implemented for points.
         *
         * @see {@link https://postgis.net/docs/manual-1.4/ST_Distance_Sphere.html }
         */
        distanceSphere(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;

        /**
         * Returns true if the geometries are within the specified distance of one another. For
         * geometry units are in those of spatial reference and For geography units are in meters
         * and measurement is defaulted to use_spheroid=true (measure around spheroid), for faster
         * check, use_spheroid=false to measure along sphere.
         *
         * @see {@link https://postgis.net/docs/ST_DWithin.html }
         */
        dwithin(geom1: ColumnName, geom2: ColumnName, distance: number, spheroid?: boolean): ExtendedKnexRaw;

        /**
         * Returns a geometry that represents the shared portion of geomA and geomB.
         *
         * @see {@link https://postgis.net/docs/ST_Intersection.html }
         */
        intersection(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;

        /**
         * Returns TRUE if the Geometries/Geography "spatially intersect in 2D" - (share any portion
         * of space) and FALSE if they don't (they are Disjoint). For geography -- tolerance is 0.00001
         * meters (so any points that close are considered to intersect)
         *
         * @see {@link https://postgis.net/docs/ST_Intersects.html }
         */
        intersects(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;

        /**
         * Casts geometry to geography
         */
        geography(geom: ColumnName): ExtendedKnexRaw;

        /**
         * Returns a geography object from the well-known text representation. SRID 4326 is assumed if unspecified.
         *
         * @see {@link https://postgis.net/docs/ST_GeographyFromText.html }
         */
        geographyFromText(ewkt: string): ExtendedKnexRaw;

        /**
         * Casts geography to geometry
         */
        geometry(geography: ColumnName): ExtendedKnexRaw;

        /**
         * Return a specified ST_Geometry value from Well-Known Text representation (WKT).
         *
         * @see {@link https://postgis.net/docs/ST_GeomFromText.html }
         */
        geomFromText(wkt: string, srid?: number): ExtendedKnexRaw;

        /**
         * Takes as input a geojson representation of a geometry and outputs a PostGIS geometry object
         *
         * @see {@link https://postgis.net/docs/ST_GeomFromGeoJSON.html }
         */
        geomFromGeoJSON(geojson: Geometry|ColumnName): ExtendedKnexRaw;

        /**
         * Creates a rectangular Polygon formed from the given minimums and maximums. Input values
         * must be in SRS specified by the SRID.
         *
         * @see {@link https://postgis.net/docs/ST_MakeEnvelope.html }
         */
        makeEnvelope(minlon: number, minlat: number, maxlon: number, maxlat: number, srid?: number): ExtendedKnexRaw;

        /**
         * Creates a 2D, 3DZ or 4D point geometry.
         *
         * @see {@link https://postgis.net/docs/ST_MakePoint.html }
         */
        makePoint(lon: number, lat: number, z?: number, measure?: number): ExtendedKnexRaw;

        /**
         * Attempts to make an invalid geometry valid without losing vertices.
         *
         * @see {@link https://postgis.net/docs/ST_MakeValid.html }
         */
        makeValid(geom: ColumnName): ExtendedKnexRaw;

        /**
         * eturns an ST_Point with the given coordinate values. OGC alias for ST_MakePoint.
         *
         * @see {@link https://postgis.net/docs/ST_Point.html }
         */
        point(lon: number, lat: number): ExtendedKnexRaw;

        /**
         * Sets the SRID on a geometry to a particular integer value. Useful in constructing bounding boxes for queries.
         *
         * @see {@link https://postgis.net/docs/ST_SetSRID.html }
         */
        setSRID(geom: ColumnName, srid: number): ExtendedKnexRaw;

        /**
         * Return a new geometry with its coordinates transformed to a different spatial reference.
         *
         * @see {@link https://postgis.net/docs/ST_Transform.html }
         */
        transform(geom: ColumnName, srid: number): ExtendedKnexRaw;

        /**
         * Returns true if the geometry A is completely inside geometry B
         *
         * @see {@link https://postgis.net/docs/ST_Within.html }
         */
        within(geom1: ColumnName, geom2: ColumnName): ExtendedKnexRaw;

        /**
         * Return the X coordinate of the point, or NULL if not available. Input must be a point.
         *
         * @see {@link https://postgis.net/docs/ST_X.html }
         */
        x(geom: ColumnName): ExtendedKnexRaw;

        /**
         * Return the Y coordinate of the point, or NULL if not available. Input must be a point.
         *
         * @see {@link https://postgis.net/docs/ST_Y.html }
         */
        y(geom: ColumnName): ExtendedKnexRaw;

        /**
         * Return the Z coordinate of the point, or NULL if not available. Input must be a point.
         *
         * @see {@link https://postgis.net/docs/ST_Z.html}
         */
        z(geom: ColumnName): ExtendedKnexRaw;

        /**
         * Return the M coordinate of a Point, or NULL if not available. Input must be a Point.
         *
         * @see {@link https://postgis.net/docs/ST_M.html}
         */
        m(geom: ColumnName): ExtendedKnexRaw;

        /**
         * Returns the geometry as a MULTI* geometry.
         *
         * @see {@link https://postgis.net/docs/ST_Multi.html }
         */
        multi(geom: ColumnName): ExtendedKnexRaw;
    }
}

export = KnexPostgis;
