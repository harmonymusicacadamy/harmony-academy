/**
 * home.js — populates the Latest News and Testimonials sections
 * on index.html straight from the Google Sheet.
 */

async function loadLatestNews() {
  const mount = document.getElementById('newsScroll');
  if (!mount) return;
  try {
    const rows = await fetchSheetTab(SITE_CONFIG.TABS.NEWS);

    if (rows.length === 0) {
      mount.innerHTML = `<div class="empty-state">No news posted yet — add a row to the "${SITE_CONFIG.TABS.NEWS}" tab in the Google Sheet and it'll show up here automatically.</div>`;
      return;
    }

    // Most recent first, where a date is parseable
    rows.sort((a, b) => {
      const da = new Date(String(a.Date).replace(/Date\((\d+),(\d+),(\d+)\)/, (_, y, m, d) => `${y}-${+m + 1}-${d}`));
      const db = new Date(String(b.Date).replace(/Date\((\d+),(\d+),(\d+)\)/, (_, y, m, d) => `${y}-${+m + 1}-${d}`));
      return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
    });

    mount.innerHTML = rows
      .map(
        (row) => `
        <article class="news-card reveal in-view">
          <div class="date">${escapeHtml(formatSheetDate(row.Date))}</div>
          <h3>${escapeHtml(row.Title)}</h3>
          ${row.Subtitle ? `<div class="subtitle">${escapeHtml(row.Subtitle)}</div>` : ''}
          ${row.Description ? `<p class="desc">${escapeHtml(row.Description)}</p>` : ''}
        </article>`
      )
      .join('');
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load news right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

async function loadTestimonials() {
  const mount = document.getElementById('testiGrid');
  if (!mount) return;
  try {
    const rows = await fetchSheetTab(SITE_CONFIG.TABS.TESTIMONIALS);

    if (rows.length === 0) {
      mount.innerHTML = `<div class="empty-state">No testimonials yet — add a row to the "${SITE_CONFIG.TABS.TESTIMONIALS}" tab and it'll appear here automatically.</div>`;
      return;
    }

    mount.innerHTML = rows
      .map((row) => {
        const linkKey = Object.keys(row).find((k) => k.toLowerCase().includes('link'));
        const embedUrl = linkKey ? driveEmbedUrl(row[linkKey]) : '';
        return `
        <article class="testi-card reveal in-view">
          ${renderStars(row.Rating)}
          <p class="quote">“${escapeHtml(row.Review)}”</p>
          <div class="testi-foot">
            <div class="name">${escapeHtml(row.Name)}</div>
            ${embedUrl ? `<button class="video-pill" onclick="openVideoModal('${embedUrl}')"><span class="dot"></span> Watch video</button>` : ''}
          </div>
        </article>`;
      })
      .join('');
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load testimonials right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadLatestNews();
  loadTestimonials();
});
