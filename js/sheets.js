async function fetchSheetTab(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SITE_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Could not reach the "${tabName}" tab (Status ${res.status}).`
    );
  }

  const raw = await res.text();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Unexpected response from Google Sheets.");
  }

  const json = JSON.parse(raw.substring(start, end + 1));

  let cols = json.table.cols.map((c, i) =>
    (c.label || c.id || `col${i}`).trim()
  );

  let dataRows = json.table.rows || [];

  // ---------------------------------------------
  // AUTO-DETECT HEADER ROW
  // ---------------------------------------------
  if (json.table.parsedNumHeaders === 0 && dataRows.length > 0) {
    cols = dataRows[0].c.map(cell => String(cell?.v || "").trim());
    dataRows = dataRows.slice(1);
  }

  const rows = dataRows.map(r => {
    const obj = {};

    cols.forEach((col, i) => {
      const cell = r.c[i];

      obj[col] =
        cell == null
          ? ""
          : (cell.f !== undefined && cell.f !== null
              ? cell.f
              : cell.v);
    });

    return obj;
  });

  return rows.filter(row =>
    Object.values(row).some(v => v !== "" && v !== null && v !== undefined)
  );
}
