/**
 * pricing.js
 * Supports both:
 * 1. Object data:
 *    { Region:"India", Level:"Beginner", Price:"₹2500", Perks:"..." }
 *
 * 2. Array data:
 *    ["India","Beginner","₹2500","..."]
 */

let allPricingRows = [];
let currentRegion = "Overseas";

function parsePerks(raw) {
    if (!raw) return [];

    return String(raw)
        .split(/\n|,/)
        .map(p => p.trim())
        .filter(Boolean);
}

function normalizePricingData(rows) {

    if (!Array.isArray(rows)) return [];

    return rows.map(row => {

        // Already object
        if (!Array.isArray(row)) {
            return {
                Region: row.Region || row.region || "",
                Level: row.Level || row.level || "",
                Price: row.Price || row.price || "",
                Perks: row.Perks || row.perks || ""
            };
        }

        // Array returned from Apps Script
        return {
            Region: row[0] || "",
            Level: row[1] || "",
            Price: row[2] || "",
            Perks: row[3] || ""
        };

    });

}

function renderPricingCards(region) {

    const mount = document.getElementById("pricingGrid");

    if (!mount) return;

    const filtered = allPricingRows.filter(row =>
        String(row.Region).trim().toLowerCase() === region.toLowerCase()
    );

    if (!filtered.length) {

        mount.innerHTML = `
            <div class="empty-state">
                No pricing found for <b>${region}</b>.
            </div>
        `;

        return;
    }

    mount.innerHTML = filtered.map(row => {

        const perks = parsePerks(row.Perks);

        return `

        <article class="price-card reveal in-view">

            <div class="level">${escapeHtml(row.Level)}</div>

            <div class="price">
                ${escapeHtml(row.Price)}
                <small>/ month</small>
            </div>

            <ul>

                ${perks.map(p=>`
                    <li>${escapeHtml(p)}</li>
                `).join("")}

            </ul>

            <a
                href="${SITE_CONFIG.GOOGLE_REG}"
                class="btn btn-outline"
                target="_blank"
                rel="noopener"
            >
                Get Started
            </a>

        </article>

        `;

    }).join("");

}

function renderRegionToggle(region) {

    currentRegion = region;

    const toggle = document.getElementById("pricingRegionToggle");

    if (!toggle) return;

    toggle.innerHTML = `

        <div class="region-selector">

            <button
                class="region-btn ${region==="India"?"active":""}"
                onclick="switchRegion('India')">
                🇮🇳 India
            </button>

            <button
                class="region-btn ${region==="Overseas"?"active":""}"
                onclick="switchRegion('Overseas')">
                🌍 Overseas
            </button>

        </div>

    `;

    renderPricingCards(region);

}

function switchRegion(region) {

    currentRegion = region;

    if (typeof setUserRegion === "function") {
        setUserRegion(region);
    }

    document.querySelectorAll(".region-btn").forEach(btn=>{

        btn.classList.toggle(
            "active",
            btn.textContent.includes(region)
        );

    });

    renderPricingCards(region);

}

async function loadPricing() {

    const mount = document.getElementById("pricingGrid");

    if (!mount) return;

    mount.innerHTML = "Loading pricing...";

    try {

        const rows = await fetchSheetTab(SITE_CONFIG.TABS.PRICING);

        console.log("Raw Pricing Data:", rows);

        allPricingRows = normalizePricingData(rows);

        console.log("Normalized:", allPricingRows);

        if (!allPricingRows.length) {

            mount.innerHTML = `
                <div class="empty-state">
                    No pricing available.
                </div>
            `;

            return;
        }

        let region = "Overseas";

        if (typeof initRegionDetection === "function") {
            region = await initRegionDetection();
        }

        renderRegionToggle(region);

    }

    catch(err){

        console.error(err);

        mount.innerHTML = `
            <div class="empty-state">
                Failed to load pricing.
            </div>
        `;

    }

}

document.addEventListener("DOMContentLoaded", loadPricing);
