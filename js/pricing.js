/**
 * pricing.js — renders the Pricing tab (Level, Price, Perks) as cards.
 * "Perks" can be written in the sheet as one perk per line (preferred)
 * or comma-separated — both are parsed correctly.
 */

console.log("pricing.js loaded");

function parsePerks(raw) {
  if (!raw) return [];
  const text = String(raw);
  const parts = text.includes('\n') ? text.split('\n') : text.split(',');
  return parts.map((p) => p.trim()).filter(Boolean);
}

async function loadPricing() {
    console.log("loadPricing started");
  const mount = document.getElementById('pricingGrid');
  if (!mount) return;
  try {
    const rows = await fetchSheetTab(SITE_CONFIG.TABS.PRICING);
    console.log(rows);

    if (rows.length === 0) {
      mount.innerHTML = `<div class="empty-state">No pricing tiers yet — add a row to the "${SITE_CONFIG.TABS.PRICING}" tab (Level, Price, Perks) and it'll appear here automatically.</div>`;
      return;
    }

    mount.innerHTML = rows
      .map((row) => {
        const perks = parsePerks(row.Perks)
          .map((p) => `<li>${escapeHtml(p)}</li>`)
          .join('');
        const priceText = String(row.Price || '').trim();
        const priceLooksNumeric = /^[\$₹€£]?\s?[\d,.]+/.test(priceText);

        return `
        <article class="price-card reveal in-view">
          <div class="level">${escapeHtml(row.Level)}</div>
          <div class="price">${escapeHtml(priceText)}${priceLooksNumeric ? '<small> / mo</small>' : ''}</div>
          <ul>${perks}</ul>
          <a href="${SITE_CONFIG.STUDENT_PORTAL_URL}" target="_blank" rel="noopener" class="btn btn-outline">Get Started</a>
        </article>`;
      })
      .join('');
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load pricing right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired");
    loadPricing();
});
