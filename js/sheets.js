/**
 * sheets.js
 * Generic reader for the Google Sheet acting as the site's CMS.
 *
 * IMPORTANT — for this to work, the Google Sheet must be shared as:
 * Share -> General access -> "Anyone with the link" -> Viewer
 */

async function fetchSheetTab(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SITE_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Could not reach the "${tabName}" tab (status ${res.status}). Make sure the sheet is shared as "Anyone with the link — Viewer."`
    );
  }

  const raw = await res.text();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error(`Unexpected response while reading the "${tabName}" tab.`);
  }

  const json = JSON.parse(raw.substring(start, end + 1));

  // Read column names returned by Google
  let cols = json.table.cols.map((c, i) =>
    (c.label || c.id || `col${i}`).trim()
  );

  let dataRows = json.table.rows || [];

  // --------------------------------------------------
  // AUTO HEADER DETECTION
  // If Google returns A,B,C instead of actual headers,
  // use the first row as the header row.
  // --------------------------------------------------
  if (json.table.parsedNumHeaders === 0 && dataRows.length > 0) {
    cols = dataRows[0].c.map(cell => String(cell?.v || "").trim());
    dataRows = dataRows.slice(1);
  }

  const rows = dataRows.map((r) => {
    const obj = {};

    cols.forEach((colName, i) => {
      const cell = r.c[i];

      obj[colName] =
        cell == null
          ? ""
          : (cell.f !== undefined && cell.f !== null)
              ? cell.f
              : cell.v;
    });

    return obj;
  });

  // Remove completely empty rows
  return rows.filter((row) =>
    Object.values(row).some(
      (v) => v !== "" && v !== null && v !== undefined
    )
  );
}

/**
 * Extracts a Google Drive file ID from any common share-link format
 * and returns an embeddable preview URL.
 */
function driveEmbedUrl(link) {
  if (!link || typeof link !== "string") return "";

  // YouTube Watch URL
  let match = link.match(/[?&]v=([^&]+)/);

  // YouTube Short URL
  if (!match) {
    match = link.match(/youtu\.be\/([^?&]+)/);
  }

  // YouTube Shorts
  if (!match) {
    match = link.match(/shorts\/([^?&]+)/);
  }

  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0`;
  }

  return "";
}

/**
 * Optional helper for images stored in Google Drive.
 */
function driveImageUrl(link) {
  if (!link || typeof link !== "string") return "";

  const idMatch = link.match(/[-\w]{20,}/);
  const id = idMatch ? idMatch[0] : "";

  return id
    ? `https://drive.google.com/uc?export=view&id=${id}`
    : "";
}

/**
 * Renders a 0–5 rating as stars.
 */
function renderStars(ratingRaw) {
  const rating = Math.max(
    0,
    Math.min(5, Math.round(parseFloat(ratingRaw) || 0))
  );

  let html = `<span class="stars" aria-label="${rating} out of 5">`;

  for (let i = 0; i < 5; i++) {
    html += i < rating ? "★" : "☆";
  }

  html += "</span>";

  return html;
}

/**
 * Escapes HTML before injecting sheet content into the DOM.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Formats dates from Google Sheets.
 */
function formatSheetDate(value) {
  if (!value) return "";

  const gvizMatch = String(value).match(
    /Date\((\d+),(\d+),(\d+)\)/
  );

  let d;

  if (gvizMatch) {
    d = new Date(
      parseInt(gvizMatch[1]),
      parseInt(gvizMatch[2]),
      parseInt(gvizMatch[3])
    );
  } else {
    d = new Date(value);
  }

  if (isNaN(d.getTime())) {
    return String(value);
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Converts a Perks string into an array.
 * Example:
 * "4 Classes|Certificate|Support"
 * =>
 * ["4 Classes","Certificate","Support"]
 */
function parsePerks(value) {
  if (!value) return [];

  return String(value)
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}
