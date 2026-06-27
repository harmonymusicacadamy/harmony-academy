// ===============================
// Shared Utility Functions
// ===============================

function escapeHtml(text) {
    if (text === null || text === undefined) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function driveEmbedUrl(url) {
    if (!url) return "";

    const match = String(url).match(/[-\w]{25,}/);

    return match
        ? `https://drive.google.com/file/d/${match[0]}/preview`
        : url;
}

function driveImageUrl(url) {
    if (!url) return "";

    const match = String(url).match(/[-\w]{25,}/);

    return match
        ? `https://drive.google.com/uc?export=view&id=${match[0]}`
        : url;
}

function parsePerks(value) {
    if (!value) return [];

    return String(value)
        .split("|")
        .map(v => v.trim())
        .filter(Boolean);
}
