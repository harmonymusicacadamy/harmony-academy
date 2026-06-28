/**
 * pricing.js — renders the Pricing tab with India/Overseas regional filtering.
 * 
 * Expected columns in the Pricing sheet:
 *   - Region (India or Overseas)
 *   - Level (tier name, e.g., "Beginner")
 *   - Price (e.g., "₹2000" or "$30")
 *   - Perks (one per line, or comma-separated)
 */

let allPricingRows = [];
let currentRegion = 'Overseas';

function parsePerks(raw) {
  if (!raw) return [];
  const text = String(raw);
  const parts = text.includes('\n') ? text.split('\n') : text.split(',');
  return parts.map((p) => p.trim()).filter(Boolean);
}

function renderPricingCards(region) {
  const mount = document.getElementById('pricingGrid');
  if (!mount) return;

  const filtered = allPricingRows.filter((row) => {
    const rowRegion = String(row.Region || '').trim();
    return rowRegion.toLowerCase() === region.toLowerCase();
  });

  if (filtered.length === 0) {
    mount.innerHTML = `<div class="empty-state">No pricing tiers for ${region} yet. Make sure your Pricing sheet has a "Region" column with values "India" or "Overseas".</div>`;
    return;
  }

  mount.innerHTML = filtered
    .map((row) => {
      const perks = parsePerks(row.Perks);
      const perkHtml = perks.length > 0 
        ? perks.map((p) => `<li>${escapeHtml(p)}</li>`).join('')
        : '<li style="opacity:0.5;"><em>No features listed</em></li>';
      
      const priceText = String(row.Price || '').trim();
      const priceLooksNumeric = /^[\$₹€£]?\s?[\d,.]+/.test(priceText);

      return `
        <article class="price-card reveal in-view">
          <div class="level">${escapeHtml(row.Level)}</div>
          <div class="price">${escapeHtml(priceText)}${priceLooksNumeric ? '<small> / month</small>' : ''}</div>
          <ul>${perkHtml}</ul>
          <a href="${SITE_CONFIG.‎GOOGLE_REG}" target="_blank" rel="noopener" class="btn btn-outline">Get Started</a>
        </article>`;
    })
    .join('');
}

function renderRegionToggle(detectedRegion) {
  const container = document.getElementById('pricingRegionToggle');
  if (!container) return;

  currentRegion = detectedRegion;

  container.innerHTML = `
    <div class="region-selector">
      <span class="region-label">Pricing for:</span>
      <div class="region-buttons">
        <button 
          class="region-btn ${currentRegion === 'India' ? 'active' : ''}" 
          data-region="India"
          onclick="switchRegion('India')">
          🇮🇳 India
        </button>
        <button 
          class="region-btn ${currentRegion === 'Overseas' ? 'active' : ''}" 
          data-region="Overseas"
          onclick="switchRegion('Overseas')">
          🌍 Overseas
        </button>
      </div>
    </div>
  `;

  renderPricingCards(currentRegion);
}

function switchRegion(region) {
  currentRegion = region;
  setUserRegion(region);
  
  // Update button states
  document.querySelectorAll('.region-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });

  renderPricingCards(region);
}

async function loadPricing() {
  const mount = document.getElementById('pricingGrid');
  if (!mount) return;

  try {
    allPricingRows = await fetchSheetTab(SITE_CONFIG.TABS.PRICING);

    if (allPricingRows.length === 0) {
      mount.innerHTML = `<div class="empty-state">No pricing tiers yet — add rows to the "${SITE_CONFIG.TABS.PRICING}" tab with columns: Region, Level, Price, Perks.</div>`;
      return;
    }

    // Detect region and show toggle
    const detected = await initRegionDetection();
    renderRegionToggle(detected);
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load pricing right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadPricing);
