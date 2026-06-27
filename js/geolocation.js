/**
 * geolocation.js — detect user's country and manage regional pricing preference.
 * Uses ip-api.com (free tier, no auth required) for auto-detection.
 * Falls back to localStorage or 'Overseas' if detection fails.
 */

const REGION_STORAGE_KEY = 'harmony_academy_region';
const INDIA_CODES = ['IN'];

async function detectUserCountry() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('Detection failed');
    const data = await res.json();
    return { code: data.country_code, name: data.country_name };
  } catch (err) {
    console.warn('Could not detect country:', err);
    return { code: null, name: null };
  }
}

function getUserRegion() {
  const stored = localStorage.getItem(REGION_STORAGE_KEY);
  if (stored && (stored === 'India' || stored === 'Overseas')) {
    return stored;
  }
  return null;
}

function setUserRegion(region) {
  if (region === 'India' || region === 'Overseas') {
    localStorage.setItem(REGION_STORAGE_KEY, region);
  }
}

async function initRegionDetection(onRegionChange) {
  let stored = getUserRegion();

  if (!stored) {
    // Auto-detect
    const { code } = await detectUserCountry();
    stored = INDIA_CODES.includes(code) ? 'India' : 'Overseas';
    setUserRegion(stored);
  }

  if (onRegionChange) {
    onRegionChange(stored);
  }

  return stored;
}
