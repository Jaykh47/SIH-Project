import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parcelsAPI } from '../services/api';
import { Search, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';

const LAND_USE_COLORS = {
  agricultural:'#059669', residential:'#0284c7', commercial:'#d97706',
  industrial:'#dc2626', forest:'#047857', govt:'#7c3aed',
};

export default function SearchPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched,setSearched]= useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await parcelsAPI.search(query.trim());
      setResults(res.data.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickSearch = (term) => {
    setQuery(term);
    setTimeout(() => handleSearch(), 50);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="page-header">
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'#064e3b', fontFamily:'Space Grotesk' }}>
            Parcel Search
          </h1>
          <p style={{ margin:0, fontSize:12, color:'#475569', marginTop:2 }}>
            Search by ULPIN, Khasra number, Plot number, or Owner name
          </p>
        </div>
      </div>

      <div className="page-body">
        {/* Search box */}
        <div style={{ maxWidth:640, margin:'0 auto 32px' }}>
          <form onSubmit={handleSearch} style={{ display:'flex', gap:8 }}>
            <div style={{ flex:1, position:'relative' }}>
              <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#059669' }} />
              <input
                className="input"
                style={{ paddingLeft:42 }}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="WB-DGP-00000013  ·  Ravi Kumar  ·  101/2  ·  P-13"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '…' : 'Search'}
            </button>
          </form>

          {/* Quick searches */}
          <div style={{ marginTop:16 }}>
            <p style={{ fontSize:11, color:'#065f46', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>
              Try these demo searches:
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['WB-DGP', 'Ravi Kumar', 'Ashok', 'agricultural', 'commercial'].map(q => (
                <button
                  key={q}
                  onClick={() => quickSearch(q)}
                  style={{
                    padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer',
                    background:'#ecfdf5', color:'#047857',
                    border:'1px solid #a7f3d0', transition:'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#d1fae5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ecfdf5'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <div style={{ fontSize:12, color:'#475569', marginBottom:12 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "<strong style={{ color:'#0f172a' }}>{query}</strong>"
            </div>
            {results.length === 0 && !loading && (
              <div style={{
                textAlign:'center', padding:48, background:'#ffffff',
                border:'1px solid rgba(5,150,105,0.2)', borderRadius:12, color:'#64748b',
                boxShadow:'var(--shadow-card)'
              }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
                <div style={{ fontWeight:600, color:'#0f172a' }}>No parcels found. Try a different search term.</div>
                <div style={{ fontSize:12, marginTop:8 }}>Try: ULPIN (WB-DGP-00000001), owner name, or khasra number</div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {results.map(r => {
                const color = LAND_USE_COLORS[r.land_use] || '#64748b';
                return (
                  <div
                    key={r.parcel_id}
                    className="glass-card"
                    style={{ padding:20, cursor:'pointer', transition:'all 0.15s' }}
                    onClick={() => navigate(`/parcels/${r.ulpin}`)}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-brand-500)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontFamily:'monospace', fontSize:16, color:'#059669', fontWeight:800 }}>
                          {r.ulpin}
                        </div>
                        <div style={{ marginTop:6, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                          <span style={{ fontSize:12, color:'#475569', fontWeight:500 }}>
                            <MapPin size={12} color="#059669" style={{ display:'inline', marginRight:4 }} />
                            {r.village_name} · {r.district_name}
                          </span>
                          <span className="badge" style={{ background:`${color}15`, color, border:`1px solid ${color}35` }}>
                            {r.land_use}
                          </span>
                          {r.plot_no && (
                            <span style={{ fontSize:12, color:'#64748b' }}>Plot: {r.plot_no}</span>
                          )}
                          {r.area_recorded && (
                            <span style={{ fontSize:12, color:'#64748b' }}>{r.area_recorded.toLocaleString()} m²</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={18} color="#059669" style={{ marginTop:4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!searched && (
          <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center', padding:48 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🗺️</div>
            <h2 style={{ color:'#064e3b', fontWeight:800, margin:'0 0 8px' }}>Search Land Parcels</h2>
            <p style={{ color:'#475569', fontSize:14, lineHeight:1.7 }}>
              Enter a ULPIN, Khasra/Dag number, Plot number, or owner name to find any parcel.
              The search covers all departmental records in the interoperability layer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
