/**
 * main.js — shared across every page.
 * Injects the header/footer, wires up the mobile nav, scroll-reveal
 * animations, and the click-to-play video modal used by testimonials.
 */

const SITE_NAV = [
  { href: "index.html", label: "Home" },
  { href: "about.html", label: "About" },
  { href: "courses.html", label: "Courses" },
  { href: "pricing.html", label: "Pricing" },
  { href: "faq.html", label: "FAQ" },
];

function renderHeader(activePage) {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  const links = SITE_NAV.map(
    (item) =>
      `<li><a href="${item.href}" class="${
        item.href === activePage ? "active" : ""
      }">${item.label}</a></li>`
  ).join("");

  mount.innerHTML = `
    <div class="nav">
      <a href="index.html" class="nav-brand">
        <img src="assets/logo-icon.png" alt="Harmony Music Academy logo" />
        <span class="nav-brand-text">
          <strong>Harmony</strong><br>
          Music Academy
          <span>School of Music</span>
        </span>
      </a>

      <ul class="nav-links" id="navLinks">
        ${links}
        <a href="${SITE_CONFIG.STUDENT_PORTAL_URL}"
           target="_blank"
           rel="noopener"
           class="btn btn-primary mobile-portal-btn">
           Login as Student
        </a>
      </ul>

      <div class="nav-actions">
        <a href="${SITE_CONFIG.STUDENT_PORTAL_URL}"
           target="_blank"
           rel="noopener"
           class="btn btn-primary">
           Login as Student
        </a>

        <button class="nav-toggle"
                id="navToggle"
                aria-label="Toggle menu"
                aria-expanded="false">
          ☰
        </button>
      </div>
    </div>
  `;

  const toggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const backdrop = document.createElement("div");
  backdrop.id = "nav-backdrop";
  document.body.appendChild(backdrop);

  toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    toggle.setAttribute("aria-expanded", isOpen);
    toggle.textContent = isOpen ? "✕" : "☰";

    if (isOpen) {
      backdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    } else {
      backdrop.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  backdrop.addEventListener("click", () => {
    navLinks.classList.remove("open");
    backdrop.classList.remove("active");
    toggle.textContent = "☰";
    toggle.setAttribute("aria-expanded", false);
    document.body.style.overflow = "";
  });

  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      backdrop.classList.remove("active");
      toggle.textContent = "☰";
      toggle.setAttribute("aria-expanded", false);
      document.body.style.overflow = "";
    });
  });
}

function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  const year = new Date().getFullYear();

  mount.innerHTML = `
    <div class="footer-grid">
      <div>
        <div class="nav-brand" style="margin-bottom:1rem;">
          <img src="assets/logo-icon.png" alt="Harmony Music Academy logo">
          <span class="nav-brand-text">
            <strong>Harmony</strong><br>
            Music Academy
          </span>
        </div>

        <p style="max-width:320px;">
          Private and group lessons in guitar, piano, vocals and more.
        </p>
      </div>

      <div>
        <h4>Explore</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="courses.html">Courses</a></li>
          <li><a href="pricing.html">Pricing</a></li>
        </ul>
      </div>

      <div>
        <h4>Contact</h4>
        <ul>
          <li>
            <a href="mailto:harmonymusicacadamy@gmail.com">
              harmonymusicacadamy@gmail.com
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      © ${year} Harmony Music Academy
    </div>
  `;
}

function initRevealAnimations() {
  const targets = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((e) => e.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  });

  targets.forEach((e) => observer.observe(e));
}

/* ================= VIDEO MODAL ================= */

function initVideoModal() {

  const overlay = document.createElement("div");

  overlay.className = "modal-overlay";
  overlay.id = "videoModalOverlay";

  overlay.innerHTML = `
    <div class="modal-box">

      <button
        class="modal-close"
        id="videoModalClose"
        aria-label="Close">
        ✕
      </button>

      <div id="videoModalContent"></div>

    </div>
  `;

  document.body.appendChild(overlay);

  const container = document.getElementById("videoModalContent");

  function closeModal() {
    container.innerHTML = "";
    overlay.classList.remove("open");
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document
    .getElementById("videoModalClose")
    .addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  window.openVideoModal = function (embedUrl) {

    if (!embedUrl) return;

    overlay.classList.add("open");

    container.innerHTML = "";

    requestAnimationFrame(() => {

      container.innerHTML = `
        <iframe
          width="100%"
          height="100%"
          src="${embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;

    });

  };

}

/* ================= PAGE LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {

  const activePage =
    document.body.getAttribute("data-page") || "index.html";

  renderHeader(activePage);
  renderFooter();

  initVideoModal();

  initRevealAnimations();

});
