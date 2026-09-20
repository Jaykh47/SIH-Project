/**
 * LANDSTACK Backend API Test Suite
 * Built with Node.js native test runner (node:test)
 */

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

describe('LANDSTACK API Integration Tests', () => {
  let officerToken = '';
  let citizenToken = '';
  let testUlpin = 'WB-DGP-00000013';

  // 1. Health & Server Status
  test('GET /health returns healthy status and DB version', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.status, 'healthy');
    assert.equal(json.database, 'connected');
    assert.ok(json.postgis, 'PostGIS version should be reported');
  });

  // 2. Authentication
  test('POST /api/auth/login succeeds for revenue officer', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'revenue@wb.gov',
        password: 'Officer@123'
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.token, 'Token should be returned');
    assert.equal(json.data.user.roleName, 'revenue_officer');
    officerToken = json.data.token;
  });

  test('POST /api/auth/login succeeds for citizen', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'citizen@demo.com',
        password: 'Citizen@123'
      })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.user.roleName, 'citizen');
    citizenToken = json.data.token;
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'revenue@wb.gov',
        password: 'WrongPassword'
      })
    });
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  // 3. Parcels & GIS
  test('GET /api/parcels returns GeoJSON FeatureCollection', async () => {
    const res = await fetch(`${BASE_URL}/api/parcels`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.type, 'FeatureCollection');
    assert.ok(Array.isArray(json.data.features));
    assert.ok(json.data.features.length > 0, 'Should have seeded parcels');

    const feature = json.data.features[0];
    assert.ok(feature.geometry, 'Feature must have geometry');
    assert.ok(feature.properties.ulpin, 'Feature must have ULPIN');
  });

  test('GET /api/map returns GeoJSON FeatureCollection (Map API alias)', async () => {
    const res = await fetch(`${BASE_URL}/api/map`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.type, 'FeatureCollection');
  });

  test('GET /api/parcels/search finds parcels by query', async () => {
    const res = await fetch(`${BASE_URL}/api/parcels/search?q=DGP`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.length > 0);
  });

  test('GET /api/parcels/:ulpin/unified returns integrated cross-department record', async () => {
    const res = await fetch(`${BASE_URL}/api/parcels/${testUlpin}/unified`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const data = json.data;

    assert.ok(data.parcel, 'Should return parcel object');
    assert.equal(data.parcel.ulpin, testUlpin);
    assert.ok(data.revenue, 'Should contain revenue data');
    assert.ok(data.registration, 'Should contain registration data');
    assert.ok(data.tax, 'Should contain tax data');
    assert.ok(data.data_quality !== undefined, 'Should contain data quality');
    assert.ok(data.ai_intelligence !== undefined, 'Should contain AI intelligence');
  });

  // 4. Alerts
  test('GET /api/alerts/summary returns alert counts for officers', async () => {
    const res = await fetch(`${BASE_URL}/api/alerts/summary`, {
      headers: { Authorization: `Bearer ${officerToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.ai_alerts !== undefined);
    assert.ok(json.data.quality_alerts !== undefined);
  });

  test('GET /api/alerts/ai requires officer authorization', async () => {
    // Attempt with citizen token -> should be denied
    const res = await fetch(`${BASE_URL}/api/alerts/ai`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.equal(res.status, 403);
  });

  // 5. Interoperability Mock Endpoints
  test('GET /mock/revenue/:ulpin returns Revenue RoR data', async () => {
    const res = await fetch(`${BASE_URL}/mock/revenue/${testUlpin}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.source.includes('Revenue Department'));
    assert.equal(json.record.ulpin, testUlpin);
  });

  test('GET /mock/registration/:ulpin returns Registry deed data', async () => {
    const res = await fetch(`${BASE_URL}/mock/registration/${testUlpin}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.source.includes('Registration Department'));
    assert.ok(Array.isArray(json.records));
  });

  test('GET /mock/tax/:ulpin returns Municipal tax data', async () => {
    const res = await fetch(`${BASE_URL}/mock/tax/${testUlpin}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.source.includes('Durgapur Municipal'));
  });
});
