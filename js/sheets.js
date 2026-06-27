async function fetchSheetTab(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SITE_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Could not reach the "${tabName}" tab (status ${res.status}). Make sure the sheet is shared as "Anyone with the link — Viewer."`
    );
  }

  const raw = await res.text();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error(`Unexpected response while reading the "${tabName}" tab.`);
  }

  const json = JSON.parse(raw.substring(start, end + 1));

  let cols = json.table.cols.map((c, i) =>
    (c.label || c.id || `col${i}`).trim()
  );

  let dataRows = json.table.rows || [];

  // -------------------------------
  // Auto-detect header row
  // -------------------------------
  if (json.table.parsedNumHeaders === 0 && dataRows.length > 0) {

    // Use first row as headers
    cols = dataRows[0].c.map(cell =>
      String(cell?.v || '').trim()
    );

    // Remove header row from data
    dataRows = dataRows.slice(1);
  }

  const rows = dataRows.map((r) => {
    const obj = {};

    cols.forEach((colName, i) => {
      const cell = r.c[i];

      obj[colName] =
        cell == null
          ? ''
          : (cell.f !== undefined && cell.f !== null)
              ? cell.f
              : cell.v;
    });

    return obj;
  });

  // Remove completely empty rows
  return rows.filter(row =>
    Object.values(row).some(v => v !== '' && v !== null && v !== undefined)
  );
}
