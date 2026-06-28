/**
 * courses.js — renders the Courses tab as a catalog grid with images.
 * Designed to adapt automatically: whatever columns you add to the
 * "Courses" tab beyond the title and image columns will be listed as
 * labeled details on each card.
 * 
 * Expected columns:
 *   - Instrument/Course/Name (title)
 *   - Image (Google Drive link or image URL) — optional
 *   - Any other columns for details (Duration, Fee, Instructor, etc.)
 */

// The column used as each card's headline. Falls back to the first column found.
const COURSE_TITLE_KEYS = ['Instrument', 'Course', 'Name', 'Title'];

// Convert Drive links to embeddable URLs
function courseImageUrl(link) {
  if (!link || typeof link !== 'string') return '';
  const idMatch = link.match(/[-\w]{20,}/);
  const id = idMatch ? idMatch[0] : '';
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w500` : link;
}

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
    const imageKey = allKeys.find((k) => k.toLowerCase() === 'image');
    const detailKeys = allKeys.filter((k) => k !== titleKey && k !== imageKey);

    mount.innerHTML = rows
      .map((row, i) => {
        const imageLink = imageKey ? row[imageKey] : '';
        const imageUrl = courseImageUrl(imageLink);
        
        const details = detailKeys
          .filter((k) => row[k] !== '' && row[k] !== null && row[k] !== undefined)
          .map((k) => `<li><span>${escapeHtml(k)}</span><span>${escapeHtml(row[k])}</span></li>`)
          .join('');

        return `
        <article class="course-card reveal in-view">
          ${imageUrl ? `
            <div class="course-image">
              <img src="${imageUrl}" alt="${escapeHtml(row[titleKey])}" />
            </div>
          ` : ''}
          <div class="course-info">
            <div class="track">Track ${String(i + 1).padStart(2, '0')}</div>
            <h3>${escapeHtml(row[titleKey])}</h3>
            ${details ? `<ul class="meta-list">${details}</ul>` : ''}
          </div>
        </article>`;
      })
      .join('');
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load courses right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadCourses);
