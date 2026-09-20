// src/Components/MapData/IntegratedDashboard.jsx
// Full React + Tailwind conversion of IntegratedMap/index.html
// Uses react-leaflet for map rendering (Leaflet 1.9.x)
// OSM tiles with required attribution © OpenStreetMap contributors

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import authStore from "../../store/authStore";
import { toast } from "sonner";

// ─── Data ──────────────────────────────────────────────────────────────────

const PARCELS = [
  {
    id: "TN-CHN-00124",
    owner: "R. Meenakshi",
    survey: "87/2B",
    area: "2,450 sq ft",
    landUse: "Residential",
    coords: [
      [13.0405, 80.2332],
      [13.0405, 80.2343],
      [13.0412, 80.2343],
      [13.0412, 80.2332],
    ],
    rights: {
      ror: "Patta No. 11842",
      ownership: "Freehold",
      registration: "Doc 2314/2024",
      encumbrance: "No active encumbrance",
    },
    planning: {
      zone: "Primary Residential",
      fsi: "2.0",
      building: "Approved · BP/2025/441",
      restriction: "None",
    },
    fiscal: {
      tax: "₹18,420 / year",
      dues: "No dues",
      valuation: "₹7,850 / sq ft",
      circle: "Zone 9",
    },
    infra: {
      water: "Connected",
      sewer: "Connected",
      power: "TANGEDCO LT",
      road: "12 m public road",
    },
  },
  {
    id: "TN-CHN-00341",
    owner: "K. Aravind",
    survey: "91/4A",
    area: "3,100 sq ft",
    landUse: "Mixed Use",
    coords: [
      [13.0414, 80.2328],
      [13.0414, 80.2339],
      [13.0422, 80.2339],
      [13.0422, 80.2328],
    ],
    rights: {
      ror: "Patta No. 12077",
      ownership: "Joint ownership",
      registration: "Doc 982/2023",
      encumbrance: "Mortgage registered",
    },
    planning: {
      zone: "Mixed Residential",
      fsi: "2.5",
      building: "Application under review",
      restriction: "Height restriction",
    },
    fiscal: {
      tax: "₹31,200 / year",
      dues: "₹2,600 pending",
      valuation: "₹9,100 / sq ft",
      circle: "Zone 9",
    },
    infra: {
      water: "Connected",
      sewer: "Connected",
      power: "TANGEDCO LT",
      road: "18 m arterial road",
    },
  },
  {
    id: "TN-CHN-00522",
    owner: "S. Prakash",
    survey: "94/1C",
    area: "1,820 sq ft",
    landUse: "Commercial",
    coords: [
      [13.0396, 80.2346],
      [13.0396, 80.2356],
      [13.0403, 80.2356],
      [13.0403, 80.2346],
    ],
    rights: {
      ror: "Patta No. 12650",
      ownership: "Freehold",
      registration: "Doc 6621/2025",
      encumbrance: "No active encumbrance",
    },
    planning: {
      zone: "Commercial",
      fsi: "3.25",
      building: "Approved · BP/2026/114",
      restriction: "Advertisement control zone",
    },
    fiscal: {
      tax: "₹44,600 / year",
      dues: "No dues",
      valuation: "₹11,500 / sq ft",
      circle: "Zone 9",
    },
    infra: {
      water: "Connected",
      sewer: "Connected",
      power: "TANGEDCO 3-phase",
      road: "24 m main road",
    },
  },
];

const INTEGRATIONS = [
  ["Land Records / RoR", "Connected", "2 min ago"],
  ["Registration", "Connected", "4 min ago"],
  ["Town Planning", "Connected", "8 min ago"],
  ["Property Tax", "Connected", "12 min ago"],
  ["Utilities", "Connected", "15 min ago"],
  ["Court / Dispute Records", "Partial", "1 hr ago"],
];

const TAB_DEFS = {
  rights: (p) => [
    ["Record of Rights", p.rights.ror],
    ["Ownership Type", p.rights.ownership],
    ["Last Registration", p.rights.registration],
    ["Encumbrance", p.rights.encumbrance],
  ],
  planning: (p) => [
    ["Planning Zone", p.planning.zone],
    ["Permissible FSI", p.planning.fsi],
    ["Building Permission", p.planning.building],
    ["Restrictions", p.planning.restriction],
  ],
  fiscal: (p) => [
    ["Property Tax", p.fiscal.tax],
    ["Outstanding Dues", p.fiscal.dues],
    ["Guideline Value", p.fiscal.valuation],
    ["Tax Zone", p.fiscal.circle],
  ],
  infra: (p) => [
    ["Water Supply", p.infra.water],
    ["Sewerage", p.infra.sewer],
    ["Electricity", p.infra.power],
    ["Road Access", p.infra.road],
  ],
};

// ─── Sub-components ────────────────────────────────────────────────────────

/** Resets map view programmatically */
function MapResetter({ trigger }) {
  const map = useMap();
  useEffect(() => {
    if (trigger) map.setView([13.0409, 80.2341], 17);
  }, [trigger, map]);
  return null;
}

/** Invalidates Leaflet size when the map tab becomes visible */
function MapInvalidator({ active }) {
  const map = useMap();
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => map.invalidateSize(), 120);
      return () => clearTimeout(t);
    }
  }, [active, map]);
  return null;
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{ borderBottom: "1px dashed #e6eaf0" }}
      className="flex justify-between items-start gap-5 py-2.5"
    >
      <span className="text-[11px] text-[#6b7485]">{label}</span>
      <strong className="text-[12px] text-right">{value}</strong>
    </div>
  );
}

function StatCard({ label, value, sub, subClass = "" }) {
  return (
    <article className="bg-white border border-[#e6eaf0] rounded-2xl p-[18px] grid gap-[7px]">
      <span className="text-[#6b7485] text-xs">{label}</span>
      <strong className="text-[27px]">{value}</strong>
      <small className={`text-[#6b7485] ${subClass}`}>{sub}</small>
    </article>
  );
}

// ─── Parcel Explorer View ──────────────────────────────────────────────────

function ParcelExplorerView({ active }) {
  const [selectedParcel, setSelectedParcel] = useState(PARCELS[0]);
  const [activeTab, setActiveTab] = useState("rights");
  const [searchQ, setSearchQ] = useState("");
  const [layers, setLayers] = useState({
    zoning: true,
    utility: true,
    restriction: true,
  });
  const [resetTrigger, setResetTrigger] = useState(0);
  const [highlightId, setHighlightId] = useState(PARCELS[0].id);

  const selectParcel = useCallback((p) => {
    setSelectedParcel(p);
    setHighlightId(p.id);
  }, []);

  const doSearch = () => {
    const q = searchQ.trim().toLowerCase();
    const found = PARCELS.find(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.survey.toLowerCase().includes(q)
    );
    if (found) {
      selectParcel(found);
      toast.success(`Parcel ${found.id} loaded`);
    } else {
      toast.error("No demo parcel matched your search");
    }
  };

  const toggleLayer = (name) =>
    setLayers((prev) => ({ ...prev, [name]: !prev[name] }));

  const tabs = ["rights", "planning", "fiscal", "infra"];
  const tabLabels = {
    rights: "Rights",
    planning: "Planning",
    fiscal: "Fiscal",
    infra: "Infra",
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <StatCard label="Total Parcels" value="12,486" sub="Demo jurisdiction" />
        <StatCard
          label="Verified Records"
          value="11,934"
          sub="95.6% digitally linked"
          subClass="text-[#14835f]!"
        />
        <StatCard
          label="Open Transactions"
          value="318"
          sub="Registration + mutation"
        />
        <StatCard
          label="Alerts"
          value="27"
          sub="Needs department review"
          subClass="text-[#a76b10]!"
        />
      </div>

      {/* Workspace grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,0.85fr)] gap-4">
        {/* Map panel */}
        <section className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[#e6eaf0] flex items-center justify-between gap-3.5 flex-wrap">
            <div>
              <h3 className="m-0 text-base font-semibold mb-1">GIS Parcel Map</h3>
              <p className="m-0 text-[#6b7485] text-xs">
                Search parcels by ULPIN, owner, locality or survey number.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Search ULPIN / owner / survey no."
                className="border border-[#e6eaf0] px-3 py-2.5 rounded-[9px] text-sm outline-none min-w-[200px] focus:border-[#176b5b]"
              />
              <button
                onClick={doSearch}
                className="border-0 bg-[#176b5b] text-white px-3.5 py-2.5 rounded-[9px] font-semibold text-sm hover:bg-[#0f8a70] transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Layer toolbar */}
          <div className="flex gap-4 items-center px-4 py-2.5 text-xs text-[#6b7485] border-b border-[#e6eaf0] flex-wrap">
            {["zoning", "utility", "restriction"].map((l) => (
              <label key={l} className="flex items-center gap-1.5 cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={layers[l]}
                  onChange={() => toggleLayer(l)}
                  className="accent-[#176b5b]"
                />
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </label>
            ))}
            <button
              onClick={() => setResetTrigger((n) => n + 1)}
              className="ml-auto border border-[#e6eaf0] bg-white px-2.5 py-1.5 rounded-lg text-xs hover:border-[#176b5b] transition-colors"
            >
              Reset view
            </button>
          </div>

          {/* Leaflet Map */}
          <MapContainer
            center={[13.0409, 80.2341]}
            zoom={17}
            style={{ height: "540px", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapResetter trigger={resetTrigger} />
            <MapInvalidator active={active} />

            {/* Parcel polygons */}
            {PARCELS.map((p) => (
              <Polygon
                key={p.id}
                positions={p.coords}
                pathOptions={
                  highlightId === p.id
                    ? { color: "#db8b28", weight: 4, fillColor: "#db8b28", fillOpacity: 0.32 }
                    : { color: "#176b5b", weight: 2, fillColor: "#4fb89f", fillOpacity: 0.22 }
                }
                eventHandlers={{
                  click: () => selectParcel(p),
                }}
              >
                <Tooltip sticky>
                  <strong>{p.id}</strong><br />
                  {p.owner}<br />
                  <small>{p.survey} · {p.landUse}</small>
                </Tooltip>
              </Polygon>
            ))}

            {/* Zoning layer */}
            {layers.zoning && (
              <Polygon
                positions={[
                  [13.0392, 80.2318],
                  [13.043, 80.2318],
                  [13.043, 80.236],
                  [13.0392, 80.236],
                ]}
                pathOptions={{
                  color: "#4a72c4",
                  weight: 1,
                  dashArray: "6,6",
                  fillColor: "#7ea2ef",
                  fillOpacity: 0.06,
                }}
              >
                <Tooltip permanent={false}>Planning Zone R2</Tooltip>
              </Polygon>
            )}

            {/* Utility layer */}
            {layers.utility && (
              <Polyline
                positions={[
                  [13.0393, 80.2322],
                  [13.0426, 80.2356],
                ]}
                pathOptions={{ color: "#3f8ec9", weight: 4, opacity: 0.7 }}
              >
                <Tooltip>Underground water main</Tooltip>
              </Polyline>
            )}

            {/* Restriction layer */}
            {layers.restriction && (
              <Polygon
                positions={[
                  [13.0416, 80.2345],
                  [13.0425, 80.2345],
                  [13.0425, 80.2354],
                  [13.0416, 80.2354],
                ]}
                pathOptions={{
                  color: "#bb694c",
                  weight: 2,
                  dashArray: "4,4",
                  fillColor: "#d8805f",
                  fillOpacity: 0.12,
                }}
              >
                <Tooltip>Height Restriction Zone</Tooltip>
              </Polygon>
            )}
          </MapContainer>
        </section>

        {/* Parcel detail panel */}
        <aside
          className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden"
          style={{ minHeight: 640 }}
        >
          <div className="px-5 py-[14px] border-b border-[#e6eaf0] flex items-center justify-between gap-3.5">
            <div>
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0f8a70] mb-1.5">
                Selected parcel
              </p>
              <h3 className="m-0 text-base font-semibold">
                ULPIN-{selectedParcel.id}
              </h3>
            </div>
            <span className="bg-[#e7f7f1] text-[#14785c] px-2.5 py-1.5 rounded-full text-[11px] font-bold">
              Verified
            </span>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-3 p-[18px]">
            {[
              ["Owner", selectedParcel.owner],
              ["Survey No.", selectedParcel.survey],
              ["Area", selectedParcel.area],
              ["Land Use", selectedParcel.landUse],
            ].map(([k, v]) => (
              <div
                key={k}
                className="bg-[#f7f9fc] border border-[#e6eaf0] rounded-[10px] p-3 grid gap-1"
              >
                <span className="text-[#6b7485] text-[11px]">{k}</span>
                <strong className="text-[13px]">{v}</strong>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex px-3.5 border-b border-[#e6eaf0]">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`border-0 bg-transparent px-2.5 py-[11px] text-xs border-b-2 transition-colors ${
                  activeTab === t
                    ? "text-[#176b5b] border-[#176b5b] font-bold"
                    : "text-[#6b7485] border-transparent"
                }`}
              >
                {tabLabels[t]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-[18px] py-[15px]">
            {TAB_DEFS[activeTab](selectedParcel).map(([label, value]) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Citizen Services View ─────────────────────────────────────────────────

const SERVICE_CONTENT = {
  verify: {
    title: "Ownership Verification",
    desc: "Enter parcel details to verify the demo Record of Rights and linked registration record.",
    type: "verifyForm",
  },
  transaction: {
    title: "Transaction Tracking",
    desc: "Example workflow status for transaction TXN-26-884271.",
    type: "info",
    rows: [
      ["Current Stage", "Mutation Review"],
      ["Department", "Revenue Department"],
      ["Status", "In Progress"],
    ],
  },
  certificate: {
    title: "Unified Land Information Report",
    desc: "This demo combines parcel identity, RoR, planning, tax, utility and restriction data into one citizen-readable report.",
    type: "report",
  },
  request: {
    title: "Raise a Service Request",
    desc: "",
    type: "requestForm",
  },
};

function CitizenServicesView({ onOpenModal }) {
  const [citizenSearch, setCitizenSearch] = useState("");

  const handleCitizenSearch = () => {
    const q = citizenSearch.trim().toLowerCase();
    const found = PARCELS.find(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.survey.toLowerCase().includes(q)
    );
    if (found) toast.success(`Parcel ${found.id} found — switch to Parcel Explorer to view.`);
    else toast.error("No demo parcel matched");
  };

  const services = [
    { key: "verify", icon: "✓", title: "Ownership Verification", desc: "Check linked RoR and current ownership status for a parcel.", btn: "Open Service" },
    { key: "transaction", icon: "⇄", title: "Transaction Tracking", desc: "Track registration, mutation, approval and dispute workflows.", btn: "Track Status" },
    { key: "certificate", icon: "▤", title: "Land Information Report", desc: "Generate a unified parcel report from linked government datasets.", btn: "Generate Report" },
    { key: "request", icon: "＋", title: "Service Request", desc: "Raise correction, mutation or map-related service requests online.", btn: "Raise Request" },
  ];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div
        className="rounded-2xl p-7 flex justify-between gap-8 items-center flex-wrap"
        style={{
          background: "linear-gradient(120deg,#f3fbf8,#fff)",
          border: "1px solid #e6eaf0",
        }}
      >
        <div>
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0f8a70] mb-1.5">
            Citizen Portal
          </p>
          <h3 className="text-2xl font-bold mt-0.5 mb-2">
            One place for land information and services
          </h3>
          <p className="text-[#6b7485] max-w-2xl leading-relaxed text-sm m-0">
            Verify a parcel, check transaction status, submit a land-related
            request, or view public records using a single parcel identity.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={citizenSearch}
            onChange={(e) => setCitizenSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCitizenSearch()}
            placeholder="Enter ULPIN or Survey Number"
            className="border border-[#e6eaf0] px-3 py-2.5 rounded-[9px] text-sm outline-none min-w-[220px] focus:border-[#176b5b]"
          />
          <button
            onClick={handleCitizenSearch}
            className="border-0 bg-[#176b5b] text-white px-3.5 py-2.5 rounded-[9px] font-semibold text-sm hover:bg-[#0f8a70] transition-colors"
          >
            Verify Parcel
          </button>
        </div>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {services.map((s) => (
          <article
            key={s.key}
            className="bg-white border border-[#e6eaf0] rounded-2xl p-5"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#e8f4f1] text-[#176b5b] grid place-items-center font-extrabold text-lg">
              {s.icon}
            </div>
            <h4 className="mt-3.5 mb-1.5 font-semibold text-sm">{s.title}</h4>
            <p className="text-[#6b7485] text-xs leading-relaxed min-h-[58px] m-0">{s.desc}</p>
            <button
              onClick={() => onOpenModal(s.key)}
              className="mt-3 w-full border-0 bg-[#eef5f3] text-[#176b5b] py-2.5 rounded-[9px] font-semibold text-sm hover:bg-[#d4ece6] transition-colors"
            >
              {s.btn}
            </button>
          </article>
        ))}
      </div>

      {/* Recent requests table */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
        <div className="px-5 py-[18px] border-b border-[#e6eaf0]">
          <h3 className="m-0 text-base font-semibold mb-1">Recent Citizen Requests</h3>
          <p className="m-0 text-[#6b7485] text-xs">Demo tracking data from integrated departmental workflows.</p>
        </div>
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Request ID", "Service", "ULPIN", "Status", "Updated"].map((h) => (
                  <th key={h} className="text-left px-[18px] py-3.5 text-[#6b7485] text-xs font-semibold bg-[#fafbfd] border-b border-[#e6eaf0]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["REQ-2026-1042", "Mutation", "TN-CHN-00124", "Under Review", "amber", "Today"],
                ["REQ-2026-1027", "Building Approval", "TN-CHN-00341", "Town Planning", "blue", "2 days ago"],
                ["REQ-2026-0988", "RoR Correction", "TN-CHN-00522", "Completed", "green", "4 days ago"],
              ].map(([id, svc, ulpin, status, color, updated]) => (
                <tr key={id}>
                  <td className="px-[18px] py-3.5 text-xs border-b border-[#e6eaf0]">{id}</td>
                  <td className="px-[18px] py-3.5 text-xs border-b border-[#e6eaf0]">{svc}</td>
                  <td className="px-[18px] py-3.5 text-xs border-b border-[#e6eaf0]">{ulpin}</td>
                  <td className="px-[18px] py-3.5 text-xs border-b border-[#e6eaf0]">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        color === "green"
                          ? "bg-[#e6f6ee] text-[#14785c]"
                          : color === "amber"
                          ? "bg-[#fff2d9] text-[#9a6515]"
                          : "bg-[#e9f1ff] text-[#3560a8]"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-[18px] py-3.5 text-xs border-b border-[#e6eaf0]">{updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard View ──────────────────────────────────────────────────

function AdminDashboardView() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="API Integrations" value="9/11" sub="Departments connected" />
        <StatCard label="Data Sync Health" value="98.4%" sub="Last sync 6 min ago" subClass="text-[#14835f]!" />
        <StatCard label="Pending Mutations" value="146" sub="Across all wards" />
        <StatCard label="Possible Conflicts" value="19" sub="AI-assisted detection" subClass="text-[#a76b10]!" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Integrations */}
        <section className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[#e6eaf0]">
            <h3 className="m-0 text-base font-semibold mb-1">Department Integration Status</h3>
            <p className="m-0 text-[#6b7485] text-xs">API and data synchronization health.</p>
          </div>
          <div className="px-[18px] py-2.5">
            {INTEGRATIONS.map(([name, status, time]) => (
              <div
                key={name}
                className="grid gap-2 py-[11px] border-b border-[#e6eaf0] last:border-0"
                style={{ gridTemplateColumns: "1fr auto" }}
              >
                <div>
                  <strong className="text-sm">{name}</strong>
                  <br />
                  <small className="text-[#6b7485] text-xs">Last sync: {time}</small>
                </div>
                <span
                  className={`text-[11px] font-bold self-center ${
                    status === "Connected" ? "text-[#14835f]" : "text-[#a76b10]"
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[#e6eaf0]">
            <h3 className="m-0 text-base font-semibold mb-1">Governance Alerts</h3>
            <p className="m-0 text-[#6b7485] text-xs">Issues requiring attention.</p>
          </div>
          <div className="p-3.5 space-y-2.5">
            {[
              { level: "high", title: "Ownership mismatch", msg: "3 parcels differ between RoR and registration records.", color: "#d34f4f" },
              { level: "medium", title: "Building footprint change", msg: "Satellite comparison flagged 8 parcels for review.", color: "#e0a640" },
              { level: "low", title: "Tax sync pending", msg: "Latest municipal property tax batch is partially synchronized.", color: "#5b8ed6" },
            ].map(({ level, title, msg, color }) => (
              <div
                key={level}
                className="px-3.5 py-3 bg-[#fbfbfc] rounded-lg grid gap-1"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <strong className="text-sm">{title}</strong>
                <span className="text-[#6b7485] text-xs">{msg}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Analytics */}
      <section className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
        <div className="px-5 py-[18px] border-b border-[#e6eaf0]">
          <h3 className="m-0 text-base font-semibold mb-1">Parcel Analytics</h3>
          <p className="m-0 text-[#6b7485] text-xs">Aggregated demo insights for planning and governance.</p>
        </div>
        <div className="p-5 grid grid-cols-2 gap-5">
          {[
            ["Residential", 62],
            ["Commercial", 19],
            ["Industrial", 8],
            ["Public / Other", 11],
          ].map(([label, pct]) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-2">
                <span>{label}</span>
                <strong>{pct}%</strong>
              </div>
              <div className="h-2 rounded-full bg-[#edf0f3] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg,#168268,#35ad8d)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Workflow View ──────────────────────────────────────────────────────────

function WorkflowView() {
  const steps = [
    { n: 1, label: "Registration submitted", sub: "Registrar Department", state: "complete" },
    { n: 2, label: "Deed validated", sub: "Digital document verification", state: "complete" },
    { n: 3, label: "Mutation review", sub: "Revenue Department", state: "active" },
    { n: 4, label: "RoR update", sub: "Land Records", state: "" },
    { n: 5, label: "Property tax sync", sub: "Municipal Corporation", state: "" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
        <div className="px-5 py-[18px] border-b border-[#e6eaf0] flex justify-between items-start gap-3">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0f8a70] mb-1">
              Inter-department workflow
            </p>
            <h3 className="m-0 text-base font-semibold">
              Registration → Mutation → Tax Update
            </h3>
            <p className="m-0 text-[#6b7485] text-xs mt-1">
              Example of interoperable parcel workflow across departments.
            </p>
          </div>
          <span className="bg-[#e9f1ff] text-[#3560a8] px-2 py-1 rounded-full text-[10px] font-bold shrink-0">
            Live Simulation
          </span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 p-6 overflow-auto">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`min-w-[140px] flex gap-2.5 items-center text-sm ${
                  s.state ? "text-[#176b5b]" : "text-[#8b95a3]"
                }`}
              >
                <span
                  className={`w-[30px] h-[30px] shrink-0 rounded-full border-2 grid place-items-center font-bold text-xs ${
                    s.state === "complete"
                      ? "bg-[#176b5b] border-[#176b5b] text-white"
                      : s.state === "active"
                      ? "border-[#176b5b]"
                      : "border-[#cfd6dd]"
                  }`}
                >
                  {s.state === "complete" ? "✓" : s.n}
                </span>
                <div>
                  <strong className="text-[11px] block">{s.label}</strong>
                  <small className="text-[9px] text-[#8b95a3]">{s.sub}</small>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="h-0.5 min-w-[35px]"
                  style={{
                    background:
                      steps[i + 1].state === "complete" || s.state === "complete"
                        ? "#176b5b"
                        : "#d8dee4",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Meta */}
        <div
          className="grid border-t border-[#e6eaf0]"
          style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
        >
          {[
            ["ULPIN", "TN-CHN-00124"],
            ["Transaction ID", "TXN-26-884271"],
            ["Started", "28 Aug 2026"],
            ["Current SLA", "2 working days"],
          ].map(([k, v]) => (
            <div key={k} className="p-4 border-r border-[#e6eaf0] last:border-0 grid gap-1">
              <span className="text-[10px] text-[#6b7485]">{k}</span>
              <strong className="text-xs">{v}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Audit trail */}
        <section className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[#e6eaf0]">
            <h3 className="m-0 text-base font-semibold mb-1">Audit Trail</h3>
            <p className="m-0 text-[#6b7485] text-xs">Immutable-style action history for transparency.</p>
          </div>
          <div className="px-[18px] py-2.5">
            {[
              ["31 Aug · 14:42", "Mutation assigned", "Revenue Officer - Ward 12"],
              ["30 Aug · 11:10", "Registration API verified deed", "Document hash matched successfully"],
              ["28 Aug · 16:24", "Citizen submitted registration", "Digital identity authentication successful"],
            ].map(([time, action, detail]) => (
              <div
                key={time}
                className="grid gap-4 py-3 border-b border-[#e6eaf0] last:border-0"
                style={{ gridTemplateColumns: "110px 1fr" }}
              >
                <time className="text-[10px] text-[#6b7485]">{time}</time>
                <p className="m-0 text-xs leading-relaxed">
                  <strong>{action}</strong>
                  <br />
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* API Events */}
        <section className="bg-white border border-[#e6eaf0] rounded-2xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[#e6eaf0]">
            <h3 className="m-0 text-base font-semibold mb-1">API Events</h3>
            <p className="m-0 text-[#6b7485] text-xs">Illustrative machine-to-machine interoperability.</p>
          </div>
          <pre
            className="m-3.5 rounded-[10px] p-[18px] text-[11px] leading-[1.7] overflow-auto"
            style={{ background: "#101922", color: "#c5f6e8" }}
          >
{`POST /api/v1/parcel/TN-CHN-00124/mutation
200 OK

GET /api/v1/ror/TN-CHN-00124
200 OK

POST /api/v1/tax/sync
202 ACCEPTED`}
          </pre>
        </section>
      </div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────

function ServiceModal({ serviceKey, onClose }) {
  const [query, setQuery] = useState("");
  const [verifiedParcel, setVerifiedParcel] = useState(null);
  const [requestType, setRequestType] = useState("Mutation Request");
  const [requestDesc, setRequestDesc] = useState("");

  if (!serviceKey) return null;
  const content = SERVICE_CONTENT[serviceKey];

  const handleVerify = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    const found = PARCELS.find(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.survey.toLowerCase().includes(q)
    );
    if (found) setVerifiedParcel(found);
    else toast.error("No demo parcel matched");
  };

  const handleRequest = (e) => {
    e.preventDefault();
    onClose();
    toast.success("Demo request submitted · REQ-2026-1108");
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-5"
      style={{ background: "#0c1823aa" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-[560px] w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3 border-0 bg-transparent text-2xl text-[#6b7485] hover:text-black"
        >
          ×
        </button>
        <h3 className="mt-0 mb-2 text-lg font-semibold">{content.title}</h3>
        {content.desc && (
          <p className="text-[#6b7485] leading-relaxed text-sm">{content.desc}</p>
        )}

        {content.type === "verifyForm" && !verifiedParcel && (
          <form onSubmit={handleVerify} className="grid gap-2.5 mt-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ULPIN / Survey No."
              required
              className="p-[11px] border border-[#e6eaf0] rounded-[9px] text-sm outline-none focus:border-[#176b5b]"
            />
            <button className="border-0 bg-[#176b5b] text-white p-[11px] rounded-[9px] font-bold text-sm hover:bg-[#0f8a70] transition-colors">
              Verify
            </button>
          </form>
        )}

        {content.type === "verifyForm" && verifiedParcel && (
          <div className="mt-2">
            <p className="text-sm text-[#6b7485]">
              <strong>{verifiedParcel.id}</strong> is linked with the demo RoR and registration datasets.
            </p>
            <InfoRow label="Owner" value={verifiedParcel.owner} />
            <InfoRow label="Survey No." value={verifiedParcel.survey} />
            <InfoRow label="Record Status" value="Verified" />
          </div>
        )}

        {content.type === "info" && (
          <div className="mt-2">
            {content.rows.map(([k, v]) => (
              <InfoRow key={k} label={k} value={v} />
            ))}
          </div>
        )}

        {content.type === "report" && (
          <button
            onClick={() => { onClose(); toast.success("Demo report generated successfully"); }}
            className="border-0 bg-[#176b5b] text-white px-3.5 py-[11px] rounded-[9px] text-sm font-semibold hover:bg-[#0f8a70] transition-colors"
          >
            Generate Demo Report
          </button>
        )}

        {content.type === "requestForm" && (
          <form onSubmit={handleRequest} className="grid gap-2.5 mt-2">
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="p-[11px] border border-[#e6eaf0] rounded-[9px] text-sm outline-none"
            >
              <option>Mutation Request</option>
              <option>RoR Correction</option>
              <option>Map Correction</option>
              <option>Building Permission Query</option>
            </select>
            <input
              placeholder="ULPIN"
              required
              className="p-[11px] border border-[#e6eaf0] rounded-[9px] text-sm outline-none focus:border-[#176b5b]"
            />
            <textarea
              rows={4}
              placeholder="Describe your request"
              value={requestDesc}
              onChange={(e) => setRequestDesc(e.target.value)}
              className="p-[11px] border border-[#e6eaf0] rounded-[9px] text-sm outline-none focus:border-[#176b5b] resize-none"
            />
            <button className="border-0 bg-[#176b5b] text-white p-[11px] rounded-[9px] font-bold text-sm hover:bg-[#0f8a70] transition-colors">
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main IntegratedDashboard ───────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "mapView",      icon: "◫", label: "Parcel Explorer" },
  { key: "citizenView", icon: "⌂", label: "Citizen Services" },
  { key: "adminView",   icon: "▦", label: "Admin Dashboard" },
  { key: "workflowView",icon: "⇄", label: "Workflow Integration" },
];

const PAGE_TITLES = {
  mapView:      "Parcel Explorer",
  citizenView:  "Citizen Services",
  adminView:    "Admin Dashboard",
  workflowView: "Workflow Integration",
};

export default function IntegratedDashboard() {
  const navigate  = useNavigate();
  const [section, setSection] = useState("mapView");
  const [role,    setRole]    = useState("Citizen");
  const [modalKey, setModalKey] = useState(null);

  const user = authStore.getLoggedInUser();
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "SK";

  const handleLogout = () => {
    authStore.clearLoggedInUser();
    navigate("/");
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#f4f7fb", color: "#162033" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-[250px] shrink-0 flex flex-col sticky top-0 h-screen px-[18px] py-6"
        style={{ background: "#0d1d2a", color: "#fff" }}
      >
        {/* Brand */}
        <div className="flex gap-3 items-center px-2 pb-6">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center font-extrabold shrink-0"
            style={{
              background: "linear-gradient(135deg,#2fb98f,#6dd7b8)",
              color: "#06241d",
            }}
          >
            LS
          </div>
          <div>
            <h1 className="m-0 text-[19px] font-bold">LandStack</h1>
            <span className="text-[11px] text-[#9fb0bc]">Digital Public Infrastructure</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="grid gap-2">
          {NAV_ITEMS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`border-0 text-left flex gap-2.5 items-center px-3.5 py-3 rounded-[10px] text-sm transition-colors ${
                section === key
                  ? "bg-[#183142] text-white"
                  : "bg-transparent text-[#b7c3cc] hover:bg-[#183142] hover:text-white"
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Pilot info card */}
        <div
          className="mt-auto rounded-2xl p-4 grid gap-1.5"
          style={{ background: "#142a39", border: "1px solid #254253" }}
        >
          <span className="text-[10px] uppercase text-[#7ed7bd] tracking-[0.1em] font-semibold">
            Pilot Demo
          </span>
          <strong className="text-sm">Tamil Nadu · Chennai</strong>
          <small className="text-[#96aab7] text-xs leading-[1.5]">
            Mock data for prototype demonstration
          </small>
        </div>

        {/* Status footer */}
        <div className="flex gap-2 items-center text-[#9fb0bc] mt-4 px-2">
          <span className="w-2 h-2 rounded-full bg-[#5fe1a8] shrink-0" />
          <small className="text-xs">All systems operational</small>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-3 border border-[#254253] bg-transparent text-[#9fb0bc] text-xs py-2 rounded-lg hover:border-[#5fe1a8] hover:text-[#5fe1a8] transition-colors"
        >
          ← Logout
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 px-7 pb-9">
        {/* Topbar */}
        <header className="h-[88px] flex items-center justify-between">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0f8a70] mb-1.5">
              Integrated GIS-based Digital Public Infrastructure
            </p>
            <h2 className="m-0 text-2xl font-bold">{PAGE_TITLES[section]}</h2>
          </div>
          <div className="flex items-center gap-3.5">
            {/* Role switcher */}
            <div className="flex items-center gap-2 bg-white border border-[#e6eaf0] px-2.5 py-2 rounded-[10px] text-[#6b7485] text-xs">
              <span>Role</span>
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); toast.info(`Role switched to ${e.target.value}`); }}
                className="border-0 outline-0 font-semibold text-[#162033] bg-transparent text-xs"
              >
                {["Citizen", "Revenue Officer", "Registrar", "Town Planner", "Administrator"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            {/* Avatar */}
            <div className="w-[38px] h-[38px] rounded-full bg-[#dfe9f1] grid place-items-center font-bold text-xs">
              {initials}
            </div>
          </div>
        </header>

        {/* Views */}
        {section === "mapView"      && <ParcelExplorerView  active={section === "mapView"} />}
        {section === "citizenView"  && <CitizenServicesView onOpenModal={setModalKey} />}
        {section === "adminView"    && <AdminDashboardView />}
        {section === "workflowView" && <WorkflowView />}
      </main>

      {/* Modal */}
      {modalKey && (
        <ServiceModal serviceKey={modalKey} onClose={() => setModalKey(null)} />
      )}
    </div>
  );
}
