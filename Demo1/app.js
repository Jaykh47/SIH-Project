const parcels = [
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

const map = L.map("map", { zoomControl: true }).setView([13.0409, 80.2341], 17);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const parcelLayer = L.layerGroup().addTo(map);
const zoningLayer = L.layerGroup().addTo(map);
const utilityLayer = L.layerGroup().addTo(map);
const restrictionLayer = L.layerGroup().addTo(map);
const polygons = {};

function popupHtml(p) {
  return `<div class="map-popup"><strong>${p.id}</strong><small>${p.owner}</small><small>${p.survey} · ${p.landUse}</small></div>`;
}

parcels.forEach((p, i) => {
  const poly = L.polygon(p.coords, {
    color: "#176b5b",
    weight: 2,
    fillColor: "#4fb89f",
    fillOpacity: 0.22,
  }).addTo(parcelLayer);
  polygons[p.id] = poly;
  poly.bindPopup(popupHtml(p));
  poly.on("click", () => selectParcel(p.id, true));
});

L.polygon(
  [
    [13.0392, 80.2318],
    [13.043, 80.2318],
    [13.043, 80.236],
    [13.0392, 80.236],
  ],
  {
    color: "#4a72c4",
    weight: 1,
    dashArray: "6,6",
    fillColor: "#7ea2ef",
    fillOpacity: 0.06,
  },
)
  .bindTooltip("Planning Zone R2")
  .addTo(zoningLayer);

L.polyline(
  [
    [13.0393, 80.2322],
    [13.0426, 80.2356],
  ],
  { color: "#3f8ec9", weight: 4, opacity: 0.7 },
)
  .bindTooltip("Underground water main")
  .addTo(utilityLayer);

L.polygon(
  [
    [13.0416, 80.2345],
    [13.0425, 80.2345],
    [13.0425, 80.2354],
    [13.0416, 80.2354],
  ],
  {
    color: "#bb694c",
    weight: 2,
    dashArray: "4,4",
    fillColor: "#d8805f",
    fillOpacity: 0.12,
  },
)
  .bindTooltip("Height Restriction Zone")
  .addTo(restrictionLayer);

const tabs = {
  rightsTab: (p) => [
    ["Record of Rights", p.rights.ror],
    ["Ownership Type", p.rights.ownership],
    ["Last Registration", p.rights.registration],
    ["Encumbrance", p.rights.encumbrance],
  ],
  planningTab: (p) => [
    ["Planning Zone", p.planning.zone],
    ["Permissible FSI", p.planning.fsi],
    ["Building Permission", p.planning.building],
    ["Restrictions", p.planning.restriction],
  ],
  fiscalTab: (p) => [
    ["Property Tax", p.fiscal.tax],
    ["Outstanding Dues", p.fiscal.dues],
    ["Guideline Value", p.fiscal.valuation],
    ["Tax Zone", p.fiscal.circle],
  ],
  infraTab: (p) => [
    ["Water Supply", p.infra.water],
    ["Sewerage", p.infra.sewer],
    ["Electricity", p.infra.power],
    ["Road Access", p.infra.road],
  ],
};

function renderRows(target, rows) {
  document.getElementById(target).innerHTML = rows
    .map(
      ([a, b]) =>
        `<div class="info-row"><span>${a}</span><strong>${b}</strong></div>`,
    )
    .join("");
}
function selectParcel(id, zoom = false) {
  const p = parcels.find((x) => x.id === id);
  if (!p) return false;
  document.getElementById("parcelTitle").textContent = "ULPIN-" + p.id;
  document.getElementById("ownerName").textContent = p.owner;
  document.getElementById("surveyNo").textContent = p.survey;
  document.getElementById("parcelArea").textContent = p.area;
  document.getElementById("landUse").textContent = p.landUse;
  Object.keys(tabs).forEach((k) => renderRows(k, tabs[k](p)));
  Object.entries(polygons).forEach(([pid, poly]) => {
    poly.setStyle(
      pid === id
        ? { color: "#db8b28", weight: 4, fillOpacity: 0.32 }
        : { color: "#176b5b", weight: 2, fillOpacity: 0.22 },
    );
  });
  if (zoom) {
    map.fitBounds(polygons[id].getBounds(), { padding: [80, 80] });
    polygons[id].openPopup();
  }
  return true;
}
selectParcel(parcels[0].id);

document.querySelectorAll(".tab").forEach((btn) =>
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  }),
);

const pageTitles = {
  mapView: "Parcel Explorer",
  citizenView: "Citizen Services",
  adminView: "Admin Dashboard",
  workflowView: "Workflow Integration",
};
document.querySelectorAll(".nav-item").forEach((btn) =>
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".view")
      .forEach((v) => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.section).classList.add("active");
    document.getElementById("pageTitle").textContent =
      pageTitles[btn.dataset.section];
    if (btn.dataset.section === "mapView")
      setTimeout(() => map.invalidateSize(), 100);
  }),
);

function doSearch(value) {
  const q = value.trim().toLowerCase();
  const p = parcels.find(
    (x) =>
      x.id.toLowerCase().includes(q) ||
      x.owner.toLowerCase().includes(q) ||
      x.survey.toLowerCase().includes(q),
  );
  if (p) {
    selectParcel(p.id, true);
    showToast(`Parcel ${p.id} loaded`);
    return p;
  }
  showToast("No demo parcel matched your search");
}
document
  .getElementById("searchBtn")
  .addEventListener("click", () =>
    doSearch(document.getElementById("parcelSearch").value),
  );
document.getElementById("parcelSearch").addEventListener("keydown", (e) => {
  if (e.key === "Enter") doSearch(e.target.value);
});

document.querySelectorAll(".layer-toggle").forEach((cb) =>
  cb.addEventListener("change", () => {
    const obj = {
      zoning: zoningLayer,
      utility: utilityLayer,
      restriction: restrictionLayer,
    }[cb.dataset.layer];
    cb.checked ? obj.addTo(map) : map.removeLayer(obj);
  }),
);
document
  .getElementById("resetMapBtn")
  .addEventListener("click", () => map.setView([13.0409, 80.2341], 17));

const integrations = [
  ["Land Records / RoR", "Connected", "2 min ago"],
  ["Registration", "Connected", "4 min ago"],
  ["Town Planning", "Connected", "8 min ago"],
  ["Property Tax", "Connected", "12 min ago"],
  ["Utilities", "Connected", "15 min ago"],
  ["Court / Dispute Records", "Partial", "1 hr ago"],
];
document.getElementById("integrationList").innerHTML = integrations
  .map(
    (x) => `
 <div class="integration-item"><div><strong>${x[0]}</strong><br><small>Last sync: ${x[2]}</small></div>
 <span class="integration-status">${x[1]}</span></div>`,
  )
  .join("");

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}
const modal = document.getElementById("modal"),
  modalBody = document.getElementById("modalBody");
document.getElementById("modalClose").onclick = () =>
  modal.classList.remove("show");

const serviceContent = {
  verify: `<h3>Ownership Verification</h3><p>Enter parcel details to verify the demo Record of Rights and linked registration record.</p>
 <form class="modal-form" onsubmit="event.preventDefault(); verifyFromModal(this)">
 <input name="query" placeholder="ULPIN / Survey No." required><button>Verify</button></form>`,
  transaction: `<h3>Transaction Tracking</h3><p>Example workflow status for transaction <strong>TXN-26-884271</strong>.</p>
 <div class="info-row"><span>Current Stage</span><strong>Mutation Review</strong></div>
 <div class="info-row"><span>Department</span><strong>Revenue Department</strong></div>
 <div class="info-row"><span>Status</span><strong>In Progress</strong></div>`,
  certificate: `<h3>Unified Land Information Report</h3><p>This demo combines parcel identity, RoR, planning, tax, utility and restriction data into one citizen-readable report.</p>
 <button onclick="showToast('Demo report generated successfully')" style="border:0;background:#176b5b;color:white;padding:11px 14px;border-radius:9px">Generate Demo Report</button>`,
  request: `<h3>Raise a Service Request</h3><form class="modal-form" onsubmit="event.preventDefault(); submitRequest()">
 <select><option>Mutation Request</option><option>RoR Correction</option><option>Map Correction</option><option>Building Permission Query</option></select>
 <input placeholder="ULPIN" required><textarea rows="4" placeholder="Describe your request"></textarea><button>Submit Request</button></form>`,
};
document.querySelectorAll(".service-card").forEach((c) =>
  c.querySelector("button").addEventListener("click", () => {
    modalBody.innerHTML = serviceContent[c.dataset.service];
    modal.classList.add("show");
  }),
);
window.verifyFromModal = (form) => {
  const p = doSearch(form.query.value);
  if (p) {
    modalBody.innerHTML = `<h3>Verified Parcel</h3><p><strong>${p.id}</strong> is linked with the demo RoR and registration datasets.</p>
 <div class="info-row"><span>Owner</span><strong>${p.owner}</strong></div><div class="info-row"><span>Survey No.</span><strong>${p.survey}</strong></div>
 <div class="info-row"><span>Record Status</span><strong>Verified</strong></div>`;
  }
};
window.submitRequest = () => {
  modal.classList.remove("show");
  showToast("Demo request submitted · REQ-2026-1108");
};

document.getElementById("citizenSearchBtn").addEventListener("click", () => {
  const p = doSearch(document.getElementById("citizenSearch").value);
  if (p) {
    document.querySelector('[data-section="mapView"]').click();
  }
});
document
  .getElementById("roleSelect")
  .addEventListener("change", (e) =>
    showToast(`Role switched to ${e.target.value}`),
  );
