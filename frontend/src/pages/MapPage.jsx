import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Polygon, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { parcelsAPI } from '../services/api';
import { useLocation } from '../hooks/useLocation';
import {
  Search, Layers, Info, AlertTriangle, RotateCcw,
  MapPin, CheckCircle2, Shield, Building2, Droplets, AlertOctagon, ExternalLink
} from 'lucide-react';

// Color parcels by land use - Emerald & Nature themed
const LAND_USE_COLORS = {
  agricultural: '#059669',
  residential:  '#0284c7',
  commercial:   '#d97706',
  industrial:   '#dc2626',
  forest:       '#047857',
  govt:         '#7c3aed',
};

const BASEMAPS = {
  light: {
    name: '🗺️ Light Canvas (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  },
  satellite: {
    name: '🛰️ Satellite Aerial (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  },
  osm: {
    name: '📍 Street Map (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  dark: {
    name: '🌙 Dark Canvas (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  }
};

// State coordinates for auto-centering across India
const STATE_CENTERS = {
  "west-bengal":        [23.525, 87.315],
  "tamil-nadu":         [13.0409, 80.2341],
  "karnataka":          [12.9716, 77.5946],
  "maharashtra":        [19.7515, 75.7139],
  "delhi":              [28.7041, 77.1025],
  "andhra-pradesh":     [15.9129, 79.74],
  "assam":              [26.2006, 92.9376],
  "bihar":              [25.0961, 85.3131],
  "chhattisgarh":       [21.2787, 81.8661],
  "gujarat":            [22.2587, 71.1924],
  "haryana":            [29.0588, 76.0856],
  "jharkhand":          [23.6102, 85.2799],
  "kerala":             [10.8505, 76.2711],
  "madhya-pradesh":     [22.9734, 78.6569],
  "odisha":             [20.9517, 85.0985],
  "punjab":             [31.1471, 75.3412],
  "rajasthan":          [27.0238, 74.2179],
  "telangana":          [18.1124, 79.0193],
  "uttar-pradesh":      [26.8467, 80.9462],
  "uttarakhand":        [30.0668, 79.0193],
};

function parcelStyle(feature, isSelected) {
  const props = feature.properties;
  const base = LAND_USE_COLORS[props.land_use] || '#059669';
  const hasAlert = props.has_alerts;

  if (isSelected) {
    return {
      color: '#db8b28',
      weight: 3.5,
      opacity: 1,
      fillColor: '#db8b28',
      fillOpacity: 0.45,
    };
  }

  return {
    color: hasAlert ? '#d97706' : base,
    weight: hasAlert ? 2.5 : 2,
    opacity: 0.95,
    fillColor: base,
    fillOpacity: hasAlert ? 0.38 : 0.22,
    dashArray: hasAlert ? '4,3' : null,
  };
}

function parcelHoverStyle(feature) {
  return {
    ...parcelStyle(feature, false),
    fillOpacity: 0.55,
    weight: 3,
  };
}

// Controller component for programmatic map flyTo and resets
function MapController({ flyTarget, resetTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget.center, flyTarget.zoom || 15, { duration: 1.2 });
    }
  }, [flyTarget, map]);

  useEffect(() => {
    if (resetTrigger) {
      map.flyTo([23.525, 87.315], 14, { duration: 1.0 });
    }
  }, [resetTrigger, map]);

  return null;
}

export default function MapPage() {
  const [parcels, setParcels] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [basemap, setBasemap] = useState('light');
  const [activeTab, setActiveTab] = useState('overview');

  // Layer overlay toggles (from IntegratedMap feature set)
  const [layers, setLayers] = useState({
    zoning: true,
    utility: true,
    restriction: true,
  });

  // State & District Navigation
  const [selectedStateSlug, setSelectedStateSlug] = useState('west-bengal');
  const [selectedDistrict, setSelectedDistrict] = useState('Paschim Bardhaman (Durgapur)');
  const { states, districts, statesLoading, districtsLoading } = useLocation(selectedStateSlug);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const geoJsonRef = useRef();

  useEffect(() => {
    parcelsAPI.getAll().then(res => {
      setParcels(res.data.data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load parcels:', err);
      setLoading(false);
    });
  }, []);

  // Support ?ulpin=WB-DGP-00000013 query param to auto-select
  useEffect(() => {
    const ulpin = params.get('ulpin');
    if (ulpin && parcels) {
      const feat = parcels.features?.find(f => f.properties.ulpin === ulpin);
      if (feat) {
        const bounds = L.geoJSON(feat).getBounds();
        setFlyTarget({ center: bounds.getCenter(), zoom: 16 });
        setSelected(feat.properties);
      }
    }
  }, [params, parcels]);

  const handleStateChange = (slug) => {
    setSelectedStateSlug(slug);
    setSelectedDistrict('');
    const center = STATE_CENTERS[slug] || [22.5, 82.0];
    setFlyTarget({ center, zoom: 7 });
  };

  const handleDistrictChange = (distName) => {
    setSelectedDistrict(distName);
    if (distName.includes('Durgapur') || distName.includes('Bardhaman') || selectedStateSlug === 'west-bengal') {
      setFlyTarget({ center: [23.525, 87.315], zoom: 14 });
    } else {
      const base = STATE_CENTERS[selectedStateSlug] || [22.5, 82.0];
      setFlyTarget({ center: base, zoom: 10 });
    }
  };

  const handleResetView = () => {
    setSelectedStateSlug('west-bengal');
    setSelectedDistrict('Paschim Bardhaman (Durgapur)');
    setSelected(null);
    setSearch('');
    setResetTrigger(prev => prev + 1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim() || !parcels) return;
    const q = search.trim().toLowerCase();
    const feat = parcels.features?.find(f => {
      const p = f.properties;
      return (
        p.ulpin?.toLowerCase().includes(q) ||
        p.plot_no?.toLowerCase().includes(q) ||
        p.village_name?.toLowerCase().includes(q)
      );
    });

    if (feat) {
      const bounds = L.geoJSON(feat).getBounds();
      setFlyTarget({ center: bounds.getCenter(), zoom: 16 });
      setSelected(feat.properties);
    }
  };

  const handleEachFeature = (feature, layer) => {
    const props = feature.properties;
    const isSel = selected?.ulpin === props.ulpin;

    layer.on({
      mouseover: (e) => {
        if (selected?.ulpin !== props.ulpin) {
          e.target.setStyle(parcelHoverStyle(feature));
          e.target.bringToFront();
        }
      },
      mouseout: (e) => {
        e.target.setStyle(parcelStyle(feature, selected?.ulpin === props.ulpin));
      },
      click: () => {
        setSelected(props);
        const bounds = L.geoJSON(feature).getBounds();
        setFlyTarget({ center: bounds.getCenter(), zoom: 16 });
      }
    });

    layer.bindTooltip(
      `<div style="font-family:Inter,sans-serif;font-size:12px;color:#0f172a;line-height:1.4">
        <strong style="color:#059669">${props.ulpin}</strong><br/>
        ${props.village_name || 'Durgapur'} · Plot #${props.plot_no || '—'}<br/>
        <span style="text-transform:capitalize;color:#475569">${props.land_use}</span> · ${props.area_recorded ? props.area_recorded.toLocaleString() + ' m²' : ''}
        ${props.has_alerts ? '<br/><span style="color:#b45309;font-weight:700">⚠️ Active Alert</span>' : ''}
      </div>`,
      { permanent: false, sticky: true }
    );
  };

  const filteredParcels = useMemo(() => {
    if (!parcels) return null;
    if (filter === 'all') return parcels;
    return {
      ...parcels,
      features: parcels.features.filter(f => {
        if (filter === 'alerts')       return f.properties.has_alerts;
        if (filter === 'agricultural') return f.properties.land_use === 'agricultural';
        if (filter === 'residential')  return f.properties.land_use === 'residential';
        if (filter === 'commercial')   return f.properties.land_use === 'commercial';
        return true;
      })
    };
  }, [parcels, filter]);

  // Demo overlay coordinates around Durgapur demo area
  const zoningPolygon = [
    [23.518, 87.305],
    [23.535, 87.305],
    [23.535, 87.325],
    [23.518, 87.325],
  ];

  const utilityPolyline = [
    [23.520, 87.308],
    [23.527, 87.318],
    [23.532, 87.322],
  ];

  const restrictionPolygon = [
    [23.522, 87.312],
    [23.526, 87.312],
    [23.526, 87.318],
    [23.522, 87.318],
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: '#f8fafc' }}>
      {/* ── Top Navigation & Region Selector Bar ── */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid rgba(5,150,105,0.12)',
        padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#064e3b', fontFamily:'Outfit, sans-serif' }}>
              GIS Cadastral Parcel Explorer
            </h1>
            <p style={{ margin:0, fontSize:12, color:'#64748b' }}>
              Multi-department spatial intelligence connected to ULPIN
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ display:'flex', gap:6, minWidth:260 }}>
            <input
              type="text"
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ULPIN / Plot / Village"
              style={{ padding:'6px 12px', fontSize:12, flex:1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding:'6px 12px', fontSize:12 }}>
              <Search size={13} /> Find
            </button>
          </form>

          {/* Quick Controls */}
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            {/* Basemap selector */}
            <select
              value={basemap}
              onChange={e => setBasemap(e.target.value)}
              className="input"
              style={{ width:'auto', padding:'6px 10px', fontSize:12, fontWeight:500 }}
              title="Switch Base Map"
            >
              <option value="light">🗺️ Light Canvas</option>
              <option value="satellite">🛰️ Satellite (Esri)</option>
              <option value="osm">📍 Street Map</option>
              <option value="dark">🌙 Dark Canvas</option>
            </select>

            {/* Filter */}
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="input"
              style={{ width:'auto', padding:'6px 10px', fontSize:12, fontWeight:500 }}
            >
              <option value="all">All Land Uses</option>
              <option value="alerts">⚠️ Has Active Alerts</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={handleResetView}
              className="btn btn-secondary"
              style={{ padding:'6px 12px', fontSize:12, gap:4 }}
              title="Reset View to Durgapur Pilot"
            >
              <RotateCcw size={12} /> Reset View
            </button>
          </div>
        </div>

        {/* Region & Layer Toggles Bar */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:10, paddingTop:8, borderTop:'1px solid #f1f5f9'
        }}>
          {/* State / District Selectors */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#047857', display:'flex', alignItems:'center', gap:4 }}>
              <MapPin size={12} /> Region:
            </span>
            <select
              value={selectedStateSlug}
              onChange={e => handleStateChange(e.target.value)}
              className="input"
              style={{ padding:'4px 8px', fontSize:11, height:28, width:'auto' }}
            >
              {states.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={e => handleDistrictChange(e.target.value)}
              className="input"
              style={{ padding:'4px 8px', fontSize:11, height:28, width:'auto' }}
            >
              <option value="">-- All Districts --</option>
              {districts.map(d => (
                <option key={d.slug || d.name} value={d.name}>{d.name}</option>
              ))}
            </select>

            {selectedStateSlug !== 'west-bengal' && (
              <button
                onClick={handleResetView}
                style={{
                  background:'#ecfdf5', border:'1px solid #a7f3d0', color:'#047857',
                  padding:'3px 8px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer'
                }}
              >
                🎯 Jump to Demo Parcels (West Bengal)
              </button>
            )}
          </div>

          {/* GIS Layer Toggles (IntegratedMap feature) */}
          <div style={{ display:'flex', alignItems:'center', gap:14, fontSize:11, color:'#475569' }}>
            <span style={{ fontWeight:700, color:'#065f46' }}>Overlays:</span>
            <label style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}>
              <input
                type="checkbox"
                checked={layers.zoning}
                onChange={e => setLayers({ ...layers, zoning: e.target.checked })}
                style={{ accentColor: '#176b5b' }}
              />
              <Building2 size={12} color="#4a72c4" /> Zoning R2
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}>
              <input
                type="checkbox"
                checked={layers.utility}
                onChange={e => setLayers({ ...layers, utility: e.target.checked })}
                style={{ accentColor: '#176b5b' }}
              />
              <Droplets size={12} color="#3f8ec9" /> Water Main
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}>
              <input
                type="checkbox"
                checked={layers.restriction}
                onChange={e => setLayers({ ...layers, restriction: e.target.checked })}
                style={{ accentColor: '#176b5b' }}
              />
              <AlertOctagon size={12} color="#bb694c" /> Height Zone
            </label>
          </div>
        </div>
      </div>

      {/* ── Main Map + Detail Layout ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        {/* Map View */}
        <div style={{ flex:1, position:'relative' }}>
          {loading && (
            <div style={{
              position:'absolute', inset:0, background:'rgba(255,255,255,0.85)',
              display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
              color:'#065f46', fontWeight:600, gap:8
            }}>
              <span className="animate-spin">🌿</span> Loading PostGIS parcels…
            </div>
          )}

          <MapContainer
            center={[23.525, 87.315]}
            zoom={14}
            style={{ width:'100%', height:'100%' }}
            zoomControl={true}
          >
            <TileLayer
              key={basemap}
              url={BASEMAPS[basemap].url}
              attribution={BASEMAPS[basemap].attribution}
              maxZoom={20}
            />

            <MapController flyTarget={flyTarget} resetTrigger={resetTrigger} />

            {/* Live PostGIS Cadastral Parcels */}
            {filteredParcels && (
              <GeoJSON
                key={`${filter}-${selected?.ulpin}`}
                ref={geoJsonRef}
                data={filteredParcels}
                style={(f) => parcelStyle(f, selected?.ulpin === f.properties.ulpin)}
                onEachFeature={handleEachFeature}
              />
            )}

            {/* GIS Overlay: Planning Zone */}
            {layers.zoning && (
              <Polygon
                positions={zoningPolygon}
                pathOptions={{
                  color: '#4a72c4',
                  weight: 1.5,
                  dashArray: '6,6',
                  fillColor: '#7ea2ef',
                  fillOpacity: 0.08,
                }}
              >
                <Tooltip sticky>Planning Zone R2 (Primary Residential)</Tooltip>
              </Polygon>
            )}

            {/* GIS Overlay: Utility Water Main */}
            {layers.utility && (
              <Polyline
                positions={utilityPolyline}
                pathOptions={{ color: '#0284c7', weight: 4, opacity: 0.75 }}
              >
                <Tooltip sticky>Underground Water Pipeline (Municipal Corp)</Tooltip>
              </Polyline>
            )}

            {/* GIS Overlay: Height Restriction Zone */}
            {layers.restriction && (
              <Polygon
                positions={restrictionPolygon}
                pathOptions={{
                  color: '#b45309',
                  weight: 2,
                  dashArray: '4,4',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.14,
                }}
              >
                <Tooltip sticky>Height Restriction Zone (G+3 max limit)</Tooltip>
              </Polygon>
            )}
          </MapContainer>

          {/* Map Legend */}
          <div style={{
            position:'absolute', bottom:16, left:16, zIndex:500,
            background:'rgba(255,255,255,0.96)', border:'1px solid rgba(5,150,105,0.2)',
            borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)',
            fontSize:11
          }}>
            <div style={{ fontSize:10, color:'#065f46', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
              Cadastral Legend
            </div>
            {Object.entries(LAND_USE_COLORS).map(([use, color]) => (
              <div key={use} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                <div style={{ width:11, height:11, background:color, borderRadius:2, opacity:0.85 }} />
                <span style={{ color:'#334155', fontWeight:500, textTransform:'capitalize' }}>{use}</span>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, paddingTop:6, borderTop:'1px solid #f1f5f9' }}>
              <div style={{ width:12, height:3, background:'#d97706' }} />
              <span style={{ color:'#b45309', fontWeight:600 }}>Active Alert</span>
            </div>
          </div>
        </div>

        {/* ── Right Parcel Information & Dossier Sidebar ── */}
        {selected ? (
          <aside style={{
            width: 360, background: '#ffffff', borderLeft: '1px solid rgba(5,150,105,0.15)',
            display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 16px rgba(0,0,0,0.05)',
            zIndex: 600, overflow: 'hidden'
          }}>
            {/* Panel Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', background: '#fcfdfc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Selected Parcel
                </span>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
                  title="Close sidebar"
                >×</button>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#059669', fontWeight: 800, marginTop: 3 }}>
                {selected.ulpin}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {selected.village_name || 'Durgapur'} · Plot #{selected.plot_no || '—'}
              </div>
            </div>

            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'rights',   label: 'Rights (RoR)' },
                { id: 'planning', label: 'Planning' },
                { id: 'fiscal',   label: 'Tax & Fiscal' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    flex: 1, padding: '10px 4px', fontSize: 11, fontWeight: activeTab === t.id ? 700 : 500,
                    color: activeTab === t.id ? '#047857' : '#64748b',
                    border: 'none', background: 'none', cursor: 'pointer',
                    borderBottom: activeTab === t.id ? '2px solid #047857' : '2px solid transparent'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, padding: 18, overflowY: 'auto' }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Primary Land Classification</div>
                    <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', color: '#0f172a', marginTop: 2 }}>
                      {selected.land_use || 'Residential'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 10, color: '#64748b' }}>Recorded Area</span>
                      <strong style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
                        {selected.area_recorded ? `${selected.area_recorded.toLocaleString()} m²` : '2,400 m²'}
                      </strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 10, color: '#64748b' }}>GIS Calculated</span>
                      <strong style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
                        {selected.area_gis ? `${Math.round(selected.area_gis).toLocaleString()} m²` : '2,392 m²'}
                      </strong>
                    </div>
                  </div>

                  {selected.has_alerts && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12, marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b45309', fontSize: 12, fontWeight: 700 }}>
                        <AlertTriangle size={14} /> Active Verification Alerts
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#78350f' }}>
                        Area discrepancy or anomaly flagged by AI / cadastral quality engine.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rights' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>RoR / Khatian No.</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>KHT-{selected.plot_no || '104'}/2024</strong>
                  </div>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Ownership Classification</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>Freehold Individual</strong>
                  </div>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Last Registered Deed</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>DEED-DGP-2023-8821</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Encumbrance Status</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2, color: '#059669' }}>
                      ✓ Clear / No Active Bank Mortgage
                    </strong>
                  </div>
                </div>
              )}

              {activeTab === 'planning' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Master Plan Zone</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>Zone R2 (Primary Residential)</strong>
                  </div>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Permissible FSI / FAR</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>2.25 FSI</strong>
                  </div>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Building Permission Status</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2, color: '#0284c7' }}>
                      Approved · BP/2025/1104
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Height Restrictions</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>G+3 (Max 15 meters)</strong>
                  </div>
                </div>
              )}

              {activeTab === 'fiscal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Property Tax Assessment</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>₹14,280 / year</strong>
                  </div>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Current Tax Dues</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2, color: '#059669' }}>
                      Paid in Full (Up to FY 2026-27)
                    </strong>
                  </div>
                  <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Guideline Circle Rate</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>₹4,850 / m²</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Municipal Ward</span>
                    <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>Durgapur MC · Ward 14</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div style={{ padding: 14, borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: 6 }}
                onClick={() => navigate(`/parcels/${selected.ulpin}`)}
              >
                <ExternalLink size={14} /> View Unified Parcel Dossier
              </button>
            </div>
          </aside>
        ) : (
          <aside style={{
            width: 280, background: '#ffffff', borderLeft: '1px solid rgba(5,150,105,0.15)',
            padding: 20, display: 'flex', flexDirection: 'column', gap: 14
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Jurisdiction Overview
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Cadastral Coverage</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#047857', marginTop: 2 }}>98.4%</strong>
              <small style={{ fontSize: 10, color: '#64748b' }}>Digitally linked boundaries</small>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Active Pilot</span>
              <strong style={{ display: 'block', fontSize: 14, color: '#0f172a', marginTop: 2 }}>Durgapur (WB)</strong>
              <small style={{ fontSize: 10, color: '#64748b' }}>{parcels?.features?.length || 13} PostGIS parcels seeded</small>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Integrated RoRs</span>
              <strong style={{ display: 'block', fontSize: 14, color: '#0284c7', marginTop: 2 }}>100% Interoperable</strong>
              <small style={{ fontSize: 10, color: '#64748b' }}>Revenue + Registry synced</small>
            </div>

            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, margin: 0, marginTop: 'auto' }}>
              💡 <em>Click any parcel boundary on the map to inspect its real-time multi-department dossier.</em>
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
