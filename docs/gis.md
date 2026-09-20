# LANDSTACK — GIS & Spatial Architecture Guide

## 1. Spatial Reference Systems (SRID)
LANDSTACK operates across two complementary spatial reference systems:
- **`EPSG:4326` (WGS 84)**: Standard latitude/longitude spherical coordinates used for GeoJSON data interchange with Leaflet and GPS mobile devices.
- **`EPSG:32644` (WGS 84 / UTM Zone 44N)**: Projected Cartesian coordinate system used for accurate, planar area and distance measurements in meters across India.

### Area Calculation Query
```sql
-- Computes real-world ground surface area in square meters
ROUND(ST_Area(ST_Transform(p.geometry, 32644))::numeric, 2) AS area_gis_computed
```

---

## 2. Spatial Indexing with PostGIS GiST
To support sub-millisecond lookups across millions of parcels, all geometric columns utilize **GiST (Generalized Search Tree)** indexes:
```sql
CREATE INDEX idx_parcels_geometry ON parcels USING GIST (geometry);
```
GiST builds an R-Tree bounding-box hierarchy. When querying parcels within an extent (`ST_Intersects` or `&&`), PostGIS evaluates bounding boxes first before conducting exact polygon boundary checks.

---

## 3. Cadastral Boundary Overlap Detection
One of LANDSTACK's key value propositions is automated identification of overlapping land titles:
```sql
SELECT 
    p1.ulpin AS parcel_1,
    p2.ulpin AS parcel_2,
    ROUND(ST_Area(ST_Transform(ST_Intersection(p1.geometry, p2.geometry), 32644))::numeric, 2) AS overlap_area_sqm
FROM parcels p1
JOIN parcels p2 ON p1.parcel_id < p2.parcel_id
WHERE ST_Overlaps(p1.geometry, p2.geometry);
```

---

## 4. Multi-Basemap Frontend Architecture
In `MapPage.jsx`, Leaflet renders vector polygons over configurable raster tile providers:
1. **Dark Canvas**: CartoDB Dark Matter (low contrast, highlights parcel boundary alert lines).
2. **Satellite Aerial**: Esri World Imagery (high-resolution aerial photographs for visual encroachment verification).
3. **OpenStreetMap**: Standard cartographic street network.
