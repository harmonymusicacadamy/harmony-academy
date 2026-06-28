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

// Convert Drive links to embeddable image URLs
function courseImageUrl(link) {
  if (!link || typeof link !== 'string') return '';
  
  const trimmed = link.trim();
  
  // If it's already an image URL (not a Drive link), return as-is
  if (trimmed.startsWith('http') && !trimmed.includes('drive.google.com')) {
    return trimmed;
  }
  
  // Extract file ID from various Google Drive URL formats
  let fileId = '';
  
  // Format: https://drive.google.com/file/d/FILE_ID/view...
  if (trimmed.includes('/d/')) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    fileId = match ? match[1] : '';
  }
  // Format: https://drive.google.com/open?id=FILE_ID
  else if (trimmed.includes('id=')) {
    const match = trimmed.match(/id=([a-zA-Z0-9-_]+)/);
    fileId = match ? match[1] : '';
  }
  // Fallback: look for any long alphanumeric string that looks like a file ID
  else {
    const match = trimmed.match(/([a-zA-Z0-9-_]{20,})/);
    fileId = match ? match[1] : '';
  }
  
  // Return thumbnail URL if we found an ID
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
  }
  
  // If it looks like a direct image URL, return it
  if (trimmed.startsWith('http')) {
    return trimmed;
  }
  
  return '';
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
