/**
 * home.js — populates the Latest News and Testimonials sections
 * on index.html straight from the Google Sheet.
 * Testimonials now render as an auto-sliding carousel.
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
  const mount = document.getElementById('testiCarousel');
  if (!mount) return;
  try {
    const rows = await fetchSheetTab(SITE_CONFIG.TABS.TESTIMONIALS);

    if (rows.length === 0) {
      mount.innerHTML = `<div class="empty-state">No testimonials yet — add a row to the "${SITE_CONFIG.TABS.TESTIMONIALS}" tab and it'll appear here automatically.</div>`;
      return;
    }

    // Create carousel slides
    const slides = rows
      .map((row) => {
        const linkKey = Object.keys(row).find((k) => k.toLowerCase().includes('link'));
        const embedUrl = linkKey ? driveEmbedUrl(row[linkKey]) : '';
        return `
        <div class="testi-slide">
          <article class="testi-card reveal in-view">
            ${renderStars(row.Rating)}
            <p class="quote">"${escapeHtml(row.Review)}"</p>
            <div class="testi-foot">
              <div class="name">${escapeHtml(row.Name)}</div>
              ${embedUrl ? `<button class="video-pill" onclick="openVideoModal('${embedUrl}')" type="button"><span class="dot"></span> Watch</button>` : ''}
            </div>
          </article>
        </div>`;
      })
      .join('');

    // Build carousel HTML
    mount.innerHTML = `
      <div class="testi-carousel-track">
        ${slides}
      </div>
      ${rows.length > 1 ? `
        <div class="carousel-dots">
          ${rows.map((_, i) => `<button class="dot ${i === 0 ? 'active' : ''}" onclick="goToTestiSlide(${i})" aria-label="Go to slide ${i + 1}"></button>`).join('')}
        </div>
      ` : ''}
    `;

    // Initialize carousel
    if (rows.length > 1) {
      initTestimonialCarousel(rows.length);
    }
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Couldn't load testimonials right now. Make sure the Google Sheet is shared as "Anyone with the link — Viewer."</div>`;
  }
}

// Global carousel state
let testiCurrentSlide = 0;
let testiAutoplayTimer = null;

function initTestimonialCarousel(totalSlides) {
  const carousel = document.getElementById('testiCarousel');
  
  // Pause on hover
  carousel.addEventListener('mouseenter', () => clearInterval(testiAutoplayTimer));
  carousel.addEventListener('mouseleave', () => startAutoplay(totalSlides));

  // Start autoplay
  startAutoplay(totalSlides);
}

function startAutoplay(totalSlides) {
  clearInterval(testiAutoplayTimer);
  testiAutoplayTimer = setInterval(() => {
    testiCurrentSlide = (testiCurrentSlide + 1) % totalSlides;
    updateTestiSlide();
  }, 5000); // Change slide every 5 seconds
}

function goToTestiSlide(index) {
  testiCurrentSlide = index;
  updateTestiSlide();
  clearInterval(testiAutoplayTimer);
  // Restart autoplay
  const totalSlides = document.querySelectorAll('.testi-slide').length;
  startAutoplay(totalSlides);
}

function updateTestiSlide() {
  const track = document.querySelector('.testi-carousel-track');
  const slides = document.querySelectorAll('.testi-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');

  if (!track || slides.length === 0) return;

  // Slide to current position
  track.style.transform = `translateX(-${testiCurrentSlide * 100}%)`;

  // Update dot indicators
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === testiCurrentSlide);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadLatestNews();
  loadTestimonials();
});
