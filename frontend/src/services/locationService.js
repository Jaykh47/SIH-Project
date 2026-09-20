// Location service for Indian states and districts
// Integrates with the open India Pincode API with complete built-in offline fallback

const BASE_URL = "https://aniket-thapa.github.io/india-pincode-api";

export const FALLBACK_STATES = [
  { name: "Andhra Pradesh", slug: "andhra-pradesh" },
  { name: "Arunachal Pradesh", slug: "arunachal-pradesh" },
  { name: "Assam", slug: "assam" },
  { name: "Bihar", slug: "bihar" },
  { name: "Chhattisgarh", slug: "chhattisgarh" },
  { name: "Goa", slug: "goa" },
  { name: "Gujarat", slug: "gujarat" },
  { name: "Haryana", slug: "haryana" },
  { name: "Himachal Pradesh", slug: "himachal-pradesh" },
  { name: "Jharkhand", slug: "jharkhand" },
  { name: "Karnataka", slug: "karnataka" },
  { name: "Kerala", slug: "kerala" },
  { name: "Madhya Pradesh", slug: "madhya-pradesh" },
  { name: "Maharashtra", slug: "maharashtra" },
  { name: "Manipur", slug: "manipur" },
  { name: "Meghalaya", slug: "meghalaya" },
  { name: "Mizoram", slug: "mizoram" },
  { name: "Nagaland", slug: "nagaland" },
  { name: "Odisha", slug: "odisha" },
  { name: "Punjab", slug: "punjab" },
  { name: "Rajasthan", slug: "rajasthan" },
  { name: "Sikkim", slug: "sikkim" },
  { name: "Tamil Nadu", slug: "tamil-nadu" },
  { name: "Telangana", slug: "telangana" },
  { name: "Tripura", slug: "tripura" },
  { name: "Uttar Pradesh", slug: "uttar-pradesh" },
  { name: "Uttarakhand", slug: "uttarakhand" },
  { name: "West Bengal", slug: "west-bengal" },
  { name: "Delhi (NCT)", slug: "delhi" },
  { name: "Jammu and Kashmir", slug: "jammu-and-kashmir" },
  { name: "Ladakh", slug: "ladakh" },
  { name: "Chandigarh", slug: "chandigarh" },
  { name: "Puducherry", slug: "puducherry" },
  { name: "Andaman and Nicobar Islands", slug: "andaman-and-nicobar" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", slug: "dadra-and-nagar-haveli" },
  { name: "Lakshadweep", slug: "lakshadweep" }
];

export const FALLBACK_DISTRICTS = {
  "west-bengal": [
    { name: "Paschim Bardhaman (Durgapur)", slug: "paschim-bardhaman" },
    { name: "Purba Bardhaman", slug: "purba-bardhaman" },
    { name: "Kolkata", slug: "kolkata" },
    { name: "North 24 Parganas", slug: "north-24-parganas" },
    { name: "South 24 Parganas", slug: "south-24-parganas" },
    { name: "Howrah", slug: "howrah" },
    { name: "Hooghly", slug: "hooghly" },
    { name: "Darjeeling", slug: "darjeeling" }
  ],
  "tamil-nadu": [
    { name: "Chennai", slug: "chennai" },
    { name: "Coimbatore", slug: "coimbatore" },
    { name: "Madurai", slug: "madurai" },
    { name: "Kanchipuram", slug: "kanchipuram" },
    { name: "Salem", slug: "salem" }
  ],
  "karnataka": [
    { name: "Bengaluru Urban", slug: "bengaluru-urban" },
    { name: "Bengaluru Rural", slug: "bengaluru-rural" },
    { name: "Mysuru", slug: "mysuru" }
  ],
  "maharashtra": [
    { name: "Mumbai City", slug: "mumbai-city" },
    { name: "Mumbai Suburban", slug: "mumbai-suburban" },
    { name: "Pune", slug: "pune" },
    { name: "Nagpur", slug: "nagpur" }
  ],
  "delhi": [
    { name: "Central Delhi", slug: "central-delhi" },
    { name: "New Delhi", slug: "new-delhi" },
    { name: "South Delhi", slug: "south-delhi" }
  ]
};

export async function fetchStates() {
  try {
    const res = await fetch(`${BASE_URL}/states.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_STATES;
  } catch (err) {
    console.warn("Using fallback states:", err.message);
    return FALLBACK_STATES;
  }
}

export async function fetchDistricts(stateSlug) {
  if (!stateSlug) return [];
  try {
    const res = await fetch(`${BASE_URL}/states/${stateSlug}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.districts && data.districts.length > 0
      ? data.districts
      : (FALLBACK_DISTRICTS[stateSlug] || [{ name: "District Headquarters", slug: "hq" }]);
  } catch (err) {
    console.warn(`Using fallback districts for ${stateSlug}:`, err.message);
    return FALLBACK_DISTRICTS[stateSlug] || [
      { name: "District Division 1", slug: "div-1" },
      { name: "District Division 2", slug: "div-2" }
    ];
  }
}
