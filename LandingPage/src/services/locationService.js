// src/services/locationService.js
// ─────────────────────────────────────────────────────────────────────────────
// All API calls related to Indian states and districts.
// Data source: https://aniket-thapa.github.io/india-pincode-api
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "https://aniket-thapa.github.io/india-pincode-api";

/**
 * Fetch the complete list of Indian states.
 *
 * @returns {Promise<Array<{ name: string, slug: string, districtCount: number }>>}
 */
export async function fetchStates() {
  const response = await fetch(`${BASE_URL}/states.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch states (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data; // Array of { name, slug, districtCount, officeCount }
}

/**
 * Fetch the districts for a given state slug.
 *
 * @param {string} stateSlug  e.g. "west-bengal"
 * @returns {Promise<Array<{ name: string, slug: string }>>}
 */
export async function fetchDistricts(stateSlug) {
  if (!stateSlug) return [];

  const response = await fetch(`${BASE_URL}/states/${stateSlug}.json`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch districts for "${stateSlug}" (HTTP ${response.status})`
    );
  }

  const data = await response.json();
  return data.districts ?? []; // Array of { name, slug, officeCount }
}
