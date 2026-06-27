/**
 * main.js — shared across every page.
 * Injects the header/footer, wires up the mobile nav, scroll-reveal
 * animations, and the click-to-play video modal used by testimonials.
 */

const SITE_NAV = [
  { href: 'index.html', label: 'Home' },
  { href: 'about.html', label: 'About' },
  { href: 'courses.html', label: 'Courses' },
  { href: 'pricing.html', label: 'Pricing' },
];

function renderHeader(activePage) {
  const mount = document.getElementById('site-header');
  if (!mount) return;

  const links = SITE_NAV.map(
    (item) => `<li><a href="${item.href}" class="${item.href === activePage ? 'active' : ''}">${item.label}</a></li>`
  ).join('');

  mount.innerHTML = `
    <div class="nav">
      <a href="index.html" class="nav-brand">
        <img src="assets/logo-icon.png" alt="Harmony Music Academy logo" />
        <span class="nav-brand-text"><strong>Harmony</strong><br>Music Academy<span>School of Music</span></span>
      </a>
      <ul class="nav-links" id="navLinks">
        ${links}
        <a href="${SITE_CONFIG.STUDENT_PORTAL_URL}" target="_blank" rel="noopener" class="btn btn-primary mobile-portal-btn">Login as Student</a>
      </ul>
      <div class="nav-actions">
        <a href="${SITE_CONFIG.STUDENT_PORTAL_URL}" target="_blank" rel="noopener" class="btn btn-primary">Login as Student</a>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
      </div>
    </div>
  `;

  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '✕' : '☰';
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    })
  );
}

function renderFooter() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  const year = new Date().getFullYear();

  mount.innerHTML = `
    <div class="footer-grid">
      <div>
        <div class="nav-brand" style="margin-bottom:1rem;">
          <img src="assets/logo-icon.png" alt="Harmony Music Academy logo" />
          <span class="nav-brand-text"><strong>Harmony</strong><br>Music Academy</span>
        </div>
        <p style="max-width:320px;">Private and group lessons in guitar, piano, drums, and more — taught by working musicians, for students of every age and level.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About Us</a></li>
          <li><a href="courses.html">Courses</a></li>
          <li><a href="pricing.html">Pricing</a></li>
          <li><a href="${SITE_CONFIG.STUDENT_PORTAL_URL}" target="_blank" rel="noopener">Student Portal</a></li>
        </ul>
      </div>
      <div>
        <h4>Get in touch</h4>
        <ul>
          <li><a href="harmonymusicacadamy@gmail.com">harmonymusicacadamy@gmail.com</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${year} Harmony Music Academy. All rights reserved.</span>
      <span>Built with care for every student's first note.</span>
    </div>
  `;
}

/** IntersectionObserver-based fade/rise-in for elements marked .reveal */
function initRevealAnimations() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach((t) => t.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((t) => observer.observe(t));
}

/** Click-to-play modal for Google Drive testimonial videos. Injects the iframe only on open. */
function initVideoModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'videoModalOverlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" id="videoModalClose" aria-label="Close video">✕</button>
      <div id="videoModalContent"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.classList.remove('open');
    document.getElementById('videoModalContent').innerHTML = '';
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.getElementById('videoModalClose').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  window.openVideoModal = (embedUrl) => {
    if (!embedUrl) return;
    document.getElementById('videoModalContent').innerHTML =
      `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    overlay.classList.add('open');
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const activePage = document.body.getAttribute('data-page') || 'index.html';
  renderHeader(activePage);
  renderFooter();
  initVideoModal();
  initRevealAnimations();
});
