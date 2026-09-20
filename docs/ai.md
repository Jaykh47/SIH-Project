# LANDSTACK — AI Land-Use Change Detection & Anomaly Engine

## 1. Problem Statement
Illegal land conversion (e.g. converting agricultural parcels to commercial layouts or constructing on government/forest land without statutory Change of Land Use permission) is widespread in suburban and rural India. Physical ground inspection by tehsildars is slow and sporadic.

LANDSTACK's AI subsystem analyzes satellite image temporal pairs to flag candidate anomalies automatically.

---

## 2. Computer Vision Pipeline

```
Sentinel-2 / High-Res Imagery (Epoch T0) ────┐
                                             ├─► Temporal Image Differencing ─► Thresholding ─► Candidate Anomaly ─► Officer Verification
Sentinel-2 / High-Res Imagery (Epoch T1) ────┘         (NDVI / Structural)
```

1. **Polygon Masking**: The cadastral boundary from PostGIS (`p.geometry`) is used to clip the satellite raster data to the exact parcel perimeter.
2. **Normalized Difference Vegetation Index (NDVI)**:
   $$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$$
   A sudden drop in NDVI on agricultural land without seasonal crop cycles indicates surface compaction or earthworks.
3. **Structural Edge Extraction**: Using OpenCV Canny edge detection and convolutional feature extraction, sudden appearance of rectangular roof edges indicates new construction.
4. **Cross-Departmental Cross-Check**:
   If an anomaly is detected, LANDSTACK checks the Municipal Building Sanction table. If no permit exists, an `ai_alert` is raised with high confidence.

---

## 3. Human-in-the-Loop (HITL) Governance Policy
- **No Automated Title Revocation**: By statutory mandate, computer vision output cannot unilaterally alter a land record.
- **Audit Justification**: When an officer acts on an alert (Verify / Dismiss), mandatory remarks are recorded in the PostgreSQL immutable `audit_logs` table with digital user attribution.
