/**
 * courses.js — renders the Courses tab as a catalog grid.
 * Designed to adapt automatically: whatever columns you add to the
 * "Courses" tab beyond the main title column will be listed as
 * labeled details on each card, so you can add Duration, Fee,
 * Instructor, etc. at any time without touching this file.
 */

// The column used as each card's headline. Falls back to the first column found.
const COURSE_TITLE_KEYS = ['Instrument', 'Course', 'Name', 'Title'];

async function loadCourses() {
  const mount = document.getElementById('courseGrid');
  if (!mount) return;
  try {
    const rows = await fetchSheetTab(SITE_CONFIG.TABS.COURSES);

    if (rows.length === 0) {
      mount.innerHTML = `<div class="empty-state">No courses listed yet — add a row to the "${SITE_CONFIG.TABS.COURSES}" tab in the Google Sheet (e.g. a column called "Instrument") and it'll appear here automatically.</div>`;
      return;
    }

    const allKeys = Object.keys(rows[0]);
    const titleKey = COURSE_TITLE_KEYS.find((k) => allKeys.includes(k)) || allKeys[0];
    const detailKeys = allKeys.filter((k) => k !== titleKey);

    mount.innerHTML = rows
      .map((row, i) => {
        const details = detailKeys
          .filter((k) => row[k] !== '' && row[k] !== null && row[k] !== undefined)
          .map((k) => `<li><span>${escapeHtml(k)}</span><span>${escapeHtml(row[k])}</span></li>`)
          .join('');

        return `
        <article class="course-card reveal in-view">
          <div class="track">Track ${String(i + 1).padStart(2, '0')}</div>
          <h3>${escapeHtml(row[titleKey])}</h3>
          ${details ? `<ul class="meta-list">${details}</ul>` : ''}
        </article>`;
      })
      .join('');
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load courses right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadCourses);
