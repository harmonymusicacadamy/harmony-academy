/**
 * sheets.js
 * Generic reader for the Google Sheet acting as the site's CMS.
 *
 * IMPORTANT â€” for this to work, the Google Sheet must be shared as:
 *   Share -> General access -> "Anyone with the link" -> Viewer
 * (Anyone editing it in the Anthropic/your team still needs separate edit access;
 *  this only controls whether the *website* can read it.)
 *
 * Usage:
 *   const rows = await fetchSheetTab('Latest News');
 *   // rows = [{ Date: '...', Title: '...', Subtitle: '...', Description: '...' }, ...]
 */

async function fetchSheetTab(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SITE_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not reach the "${tabName}" tab (status ${res.status}). Make sure the sheet is shared as "Anyone with the link â€” Viewer."`);
  }

  const raw = await res.text();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`Unexpected response while reading the "${tabName}" tab.`);
  }

  const json = JSON.parse(raw.substring(start, end + 1));
  const cols = json.table.cols.map((c, i) => (c.label || c.id || `col${i}`).trim());

  const rows = (json.table.rows || []).map((r) => {
    const obj = {};
    cols.forEach((colName, i) => {
      const cell = r.c[i];
      obj[colName] = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v) : '';
    });
    return obj;
  });

  // Drop fully-empty rows (common when a sheet has extra blank rows reserved below the data)
  return rows.filter((row) => Object.values(row).some((v) => v !== '' && v !== null && v !== undefined));
}

/**
 * Extracts a Google Drive file ID from any common share-link format and
 * returns an embeddable preview URL.
 */
function driveEmbedUrl(link) {
  if (!link || typeof link !== 'string') return '';
  const idMatch = link.match(/[-\w]{20,}/);
  const id = idMatch ? idMatch[0] : '';
  return id ? `https://drive.google.com/file/d/${id}/preview` : '';
}

/** Renders a 0â€“5 rating as gold/outline note-star markup. */
function renderStars(ratingRaw) {
  const rating = Math.max(0, Math.min(5, Math.round(parseFloat(ratingRaw) || 0)));
  let html = '<span class="stars" aria-label="' + rating + ' out of 5">';
  for (let i = 0; i < 5; i++) {
    html += i < rating ? 'â˜…' : 'â˜†';
  }
  html += '</span>';
  return html;
}

/** Basic HTML-escaping for any text pulled from the sheet before it's injected into the DOM. */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Formats sheet dates (which may arrive as JS Date(...) gviz strings, text, or numbers). */
function formatSheetDate(value) {
  if (!value) return '';
  // gviz sometimes returns dates as "Date(2026,5,20)"
  const gvizMatch = String(value).match(/Date\((\d+),(\d+),(\d+)\)/);
  let d;
  if (gvizMatch) {
    d = new Date(parseInt(gvizMatch[1]), parseInt(gvizMatch[2]), parseInt(gvizMatch[3]));
  } else {
    d = new Date(value);
  }
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
