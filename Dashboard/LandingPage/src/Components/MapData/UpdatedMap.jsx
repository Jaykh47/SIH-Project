// src/Components/MapData/UpdatedMap.jsx
// Post-login personalized state + district map view.
// Reads the logged-in user's state/district from authStore (set during signup)
// and auto-focuses the map to that region.
// Dropdown selectors allow changing state/district at any time.

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import authStore from "../../store/authStore";
import { useLocation } from "../../hooks/useLocation";
import { toast } from "sonner";

// ─── State bounding boxes (approximate lat/lon for auto-centering) ──────────
// Used to center the map when a state is selected (GeoJSON may not be available).
const STATE_CENTERS = {
  "andhra-pradesh":     [15.9129, 79.74],
  "arunachal-pradesh":  [28.218, 94.727],
  "assam":              [26.2006, 92.9376],
  "bihar":              [25.0961, 85.3131],
  "chhattisgarh":       [21.2787, 81.8661],
  "goa":                [15.2993, 74.124],
  "gujarat":            [22.2587, 71.1924],
  "haryana":            [29.0588, 76.0856],
  "himachal-pradesh":   [31.1048, 77.1734],
  "jharkhand":          [23.6102, 85.2799],
  "karnataka":          [15.3173, 75.7139],
  "kerala":             [10.8505, 76.2711],
  "madhya-pradesh":     [22.9734, 78.6569],
  "maharashtra":        [19.7515, 75.7139],
  "manipur":            [24.6637, 93.9063],
  "meghalaya":          [25.467, 91.3662],
  "mizoram":            [23.1645, 92.9376],
  "nagaland":           [26.1584, 94.5624],
  "odisha":             [20.9517, 85.0985],
  "punjab":             [31.1471, 75.3412],
  "rajasthan":          [27.0238, 74.2179],
  "sikkim":             [27.533, 88.5122],
  "tamil-nadu":         [11.1271, 78.6569],
  "telangana":          [18.1124, 79.0193],
  "tripura":            [23.9408, 91.9882],
  "uttar-pradesh":      [26.8467, 80.9462],
  "uttarakhand":        [30.0668, 79.0193],
  "west-bengal":        [22.9868, 87.855],
  "delhi":              [28.7041, 77.1025],
  "jammu-and-kashmir":  [33.7782, 76.5762],
  "ladakh":             [34.1526, 77.577],
  "chandigarh":         [30.7333, 76.7794],
  "andaman-and-nicobar":[11.7401, 92.6586],
  "lakshadweep":        [10.5667, 72.6417],
  "puducherry":         [11.9416, 79.8083],
  "dadra-and-nagar-haveli": [20.1809, 73.0169],
  "daman-and-diu":      [20.3974, 72.8328],
};

const DEFAULT_CENTER = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM   = 5;
const STATE_ZOOM     = 7;
const DISTRICT_ZOOM  = 9;

// ─── Helper: FlyTo helper component ────────────────────────────────────────
function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// ─── Stat mini-card ────────────────────────────────────────────────────────
function MiniStat({ label, value, color = "#176b5b" }) {
  return (
    <div className="bg-white border border-[#e6eaf0] rounded-xl p-4 grid gap-1">
      <span className="text-[10px] text-[#6b7485] uppercase tracking-wide font-semibold">{label}</span>
      <strong className="text-xl" style={{ color }}>{value}</strong>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function UpdatedMap() {
  const navigate = useNavigate();
  const user = authStore.getLoggedInUser();

  // Pre-fill from authStore (set during signup/login)
  const [selectedStateSlug, setSelectedStateSlug] = useState(user?.stateSlug ?? "");
  const [selectedStateName, setSelectedStateName] = useState(user?.state     ?? "");
  const [selectedDistrict,  setSelectedDistrict]  = useState(user?.district  ?? "");

  // Location hook re-used from the Auth flow
  const {
    states,
    districts,
    statesLoading,
    districtsLoading,
  } = useLocation(selectedStateSlug);

  // Formatted options
  const stateOptions = useMemo(
    () =>
      states.map((s) => ({
        label: s.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: s.slug,
        name:  s.name,
      })),
    [states]
  );

  const districtOptions = useMemo(
    () =>
      districts.map((d) => ({
        label: d.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: d.name,
      })),
    [districts]
  );

  // Derive map center & zoom
  const mapCenter = useMemo(() => {
    if (selectedStateSlug && STATE_CENTERS[selectedStateSlug]) {
      return STATE_CENTERS[selectedStateSlug];
    }
    return DEFAULT_CENTER;
  }, [selectedStateSlug]);

  const mapZoom = useMemo(() => {
    if (selectedDistrict) return DISTRICT_ZOOM;
    if (selectedStateSlug) return STATE_ZOOM;
    return DEFAULT_ZOOM;
  }, [selectedStateSlug, selectedDistrict]);

  // Handlers
  const handleStateChange = useCallback(
    (slug) => {
      const opt = stateOptions.find((s) => s.value === slug);
      setSelectedStateSlug(slug);
      setSelectedStateName(opt?.name ?? slug);
      setSelectedDistrict("");
      if (slug) toast.success(`Switched to ${opt?.label ?? slug}`);
    },
    [stateOptions]
  );

  const handleDistrictChange = useCallback(
    (name) => {
      setSelectedDistrict(name);
      if (name) toast.success(`Focused on ${name}`);
    },
    []
  );

  const handleLogout = () => {
    authStore.clearLoggedInUser();
    navigate("/");
  };

  // Mock stats that "react" to state/district selection
  const totalParcels  = selectedDistrict ? "4,182"   : selectedStateSlug ? "1,24,860" : "7,28,000";
  const verified      = selectedDistrict ? "3,947"    : selectedStateSlug ? "1,12,340" : "6,45,000";
  const openTx        = selectedDistrict ? "218"      : selectedStateSlug ? "3,480"    : "21,300";
  const alerts        = selectedDistrict ? "12"       : selectedStateSlug ? "182"      : "1,104";

  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#f4f7fb", color: "#162033" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-[270px] shrink-0 flex flex-col sticky top-0 h-screen px-5 py-6 overflow-y-auto"
        style={{ background: "#0d1d2a", color: "#fff" }}
      >
        {/* Brand */}
        <div className="flex gap-3 items-center pb-6">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center font-extrabold shrink-0 text-sm"
            style={{ background: "linear-gradient(135deg,#2fb98f,#6dd7b8)", color: "#06241d" }}
          >
            LS
          </div>
          <div>
            <h1 className="m-0 text-[18px] font-bold">LandStack</h1>
            <span className="text-[11px] text-[#9fb0bc]">My Region View</span>
          </div>
        </div>

        {/* Welcome */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "#142a39", border: "1px solid #254253" }}
        >
          <span className="text-[10px] uppercase text-[#7ed7bd] tracking-[0.1em] font-semibold">
            Logged in as
          </span>
          <p className="m-0 mt-1 font-semibold text-sm">{user?.name ?? "User"}</p>
          <p className="m-0 text-[11px] text-[#9fb0bc] mt-0.5 break-all">{user?.email ?? ""}</p>
        </div>

        {/* ── State selector ── */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#7ed7bd] mb-2">
            State / UT
          </label>
          {statesLoading ? (
            <div className="text-[#9fb0bc] text-xs py-2">Loading states…</div>
          ) : (
            <select
              value={selectedStateSlug}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] text-sm outline-none border-0 text-[#162033]"
              style={{ background: "#1e3448" }}
            >
              <option value="" style={{ background: "#1e3448", color: "#9fb0bc" }}>
                — Select a state —
              </option>
              {stateOptions.map((s) => (
                <option key={s.value} value={s.value} style={{ background: "#1e3448", color: "#fff" }}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── District selector ── */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#7ed7bd] mb-2">
            District
          </label>
          {districtsLoading ? (
            <div className="text-[#9fb0bc] text-xs py-2">Loading districts…</div>
          ) : !selectedStateSlug ? (
            <div className="text-[#6b7a88] text-xs py-2 italic">Select a state first</div>
          ) : (
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] text-sm outline-none border-0 text-[#162033]"
              style={{ background: "#1e3448" }}
            >
              <option value="" style={{ background: "#1e3448", color: "#9fb0bc" }}>
                — All districts —
              </option>
              {districtOptions.map((d) => (
                <option key={d.value} value={d.value} style={{ background: "#1e3448", color: "#fff" }}>
                  {d.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Current region */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "#142a39", border: "1px solid #254253" }}
        >
          <span className="text-[10px] uppercase text-[#7ed7bd] tracking-[0.1em] font-semibold">
            Viewing Region
          </span>
          <p className="m-0 mt-1.5 font-semibold text-sm">
            {selectedStateName || "All India"}
          </p>
          {selectedDistrict && (
            <p className="m-0 text-[11px] text-[#9fb0bc] mt-0.5">{selectedDistrict} District</p>
          )}
          {!selectedStateSlug && (
            <p className="m-0 text-[11px] text-[#9fb0bc] mt-0.5 italic">
              Select a state to zoom in
            </p>
          )}
        </div>

        {/* Mini stats */}
        <div className="space-y-2 mb-5">
          {[
            { label: "Total Parcels", value: totalParcels, color: "#162033" },
            { label: "Verified", value: verified, color: "#14835f" },
            { label: "Open Transactions", value: openTx, color: "#162033" },
            { label: "Alerts", value: alerts, color: "#a76b10" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg px-3.5 py-2.5 flex justify-between items-center"
              style={{ background: "#142a39", border: "1px solid #254253" }}
            >
              <span className="text-[11px] text-[#9fb0bc]">{label}</span>
              <strong className="text-sm" style={{ color: color === "#162033" ? "#fff" : color }}>
                {value}
              </strong>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex gap-2 items-center text-[#9fb0bc] mt-auto">
          <span className="w-2 h-2 rounded-full bg-[#5fe1a8] shrink-0" />
          <small className="text-xs">All systems operational</small>
        </div>

        {/* Nav buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-[#254253] bg-transparent text-[#9fb0bc] text-xs py-2 rounded-lg hover:border-[#2fb98f] hover:text-[#2fb98f] transition-colors"
          >
            ◫ Full GIS Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="border border-[#254253] bg-transparent text-[#9fb0bc] text-xs py-2 rounded-lg hover:border-[#e06060] hover:text-[#e06060] transition-colors"
          >
            ← Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header
          className="flex items-center justify-between px-7 border-b"
          style={{ height: 72, borderColor: "#e6eaf0", background: "#fff" }}
        >
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0f8a70] mb-1">
              Personalized Land Records
            </p>
            <h2 className="m-0 text-xl font-bold">
              {selectedDistrict
                ? `${selectedDistrict} District`
                : selectedStateName
                ? `${selectedStateName} — State Map`
                : "India Overview"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {(selectedStateSlug || selectedDistrict) && (
              <button
                onClick={() => { setSelectedStateSlug(""); setSelectedStateName(""); setSelectedDistrict(""); }}
                className="text-xs border border-[#e6eaf0] bg-white px-3 py-2 rounded-lg text-[#6b7485] hover:border-[#176b5b] hover:text-[#176b5b] transition-colors"
              >
                Reset to India view
              </button>
            )}
            <div
              className="w-9 h-9 rounded-full grid place-items-center font-bold text-xs"
              style={{ background: "#dfe9f1" }}
            >
              {user?.name
                ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                : "U"}
            </div>
          </div>
        </header>

        {/* Stats bar */}
        <div
          className="grid grid-cols-4 gap-px border-b"
          style={{ background: "#e6eaf0" }}
        >
          {[
            { label: "Total Parcels", value: totalParcels },
            { label: "Verified Records", value: verified, sub: "#14835f" },
            { label: "Open Transactions", value: openTx },
            { label: "Alerts", value: alerts, sub: "#a76b10" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white px-6 py-4">
              <span className="block text-[11px] text-[#6b7485] mb-1">{label}</span>
              <strong className="text-2xl" style={sub ? { color: sub } : {}}>
                {value}
              </strong>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1" style={{ minHeight: 0 }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%", minHeight: 500 }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <FlyTo center={mapCenter} zoom={mapZoom} />
          </MapContainer>
        </div>

        {/* Info bar */}
        <div
          className="px-7 py-3 text-xs text-[#6b7485] border-t flex items-center gap-4"
          style={{ background: "#fff", borderColor: "#e6eaf0" }}
        >
          <span>📍 Region: <strong className="text-[#162033]">{selectedStateName || "All India"}{selectedDistrict ? ` / ${selectedDistrict}` : ""}</strong></span>
          <span className="ml-auto">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors</span>
        </div>
      </main>
    </div>
  );
}
