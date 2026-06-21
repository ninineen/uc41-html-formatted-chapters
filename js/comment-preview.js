const DARK_MODE_KEY = "ao3preview-dark";
const ALLOWED_TAGS = [
    "a", "abbr", "acronym", "address", "b", "big", "blockquote", "br",
    "caption", "center", "cite", "code", "col", "colgroup", "dd", "del",
    "details", "dfn", "div", "dl", "dt", "em", "figcaption", "figure",
    "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd",
    "li", "ol", "p", "pre", "q", "ruby", "rt", "rp", "s", "samp", "small",
    "span", "strike", "strong", "sub", "summary", "sup", "table", "tbody",
    "td", "tfoot", "th", "thead", "tr", "tt", "u", "ul", "var",
];
const ALLOWED_ATTR = [
    "align", "alt", "axis", "class", "dir", "height", "href", "name",
    "src", "title", "width",
];
// ── DOM refs ───────────────────────────────────────────
const htmlInput = document.getElementById("html-input");
const commentContent = document.getElementById("comment-content");
const clearBtn = document.getElementById("clear-btn");
const warningBar = document.getElementById("warning-bar");
const sanitizedBadge = document.getElementById("sanitized-badge");
const darkToggle = document.getElementById("dark-toggle");
function sanitizeAndCollectStripped(raw) {
    const removedTags = new Set();
    const removedAttrs = new Set();
    DOMPurify.addHook("uponSanitizeElement", (_node, data) => {
        const tag = data.tagName.toLowerCase();
        const isInternal = tag === "#text" || tag === "#document";
        if (!isInternal && !ALLOWED_TAGS.includes(tag))
            removedTags.add(tag);
    });
    DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
        if (!ALLOWED_ATTR.includes(data.attrName.toLowerCase())) {
            removedAttrs.add(data.attrName.toLowerCase());
        }
    });
    const clean = DOMPurify.sanitize(raw, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        KEEP_CONTENT: true,
    });
    DOMPurify.removeAllHooks();
    return { clean, removedTags, removedAttrs };
}
function buildWarningText(removedTags, removedAttrs) {
    const parts = [];
    if (removedTags.size)
        parts.push("tags: " + [...removedTags].map(t => `<${t}>`).join(", "));
    if (removedAttrs.size)
        parts.push("attrs: " + [...removedAttrs].join(", "));
    return parts.join(" | ");
}
function updatePreview() {
    const { clean, removedTags, removedAttrs } = sanitizeAndCollectStripped(htmlInput.value);
    commentContent.innerHTML = clean;
    const warningText = buildWarningText(removedTags, removedAttrs);
    const hasWarnings = warningText.length > 0;
    warningBar.textContent = hasWarnings ? `Stripped: ${warningText}` : "";
    warningBar.style.display = hasWarnings ? "block" : "none";
    sanitizedBadge.style.display = hasWarnings ? "inline" : "none";
}
htmlInput.addEventListener("input", updatePreview);
clearBtn.addEventListener("click", () => {
    htmlInput.value = "";
    updatePreview();
    htmlInput.focus();
});
// ── dark mode ──────────────────────────────────────────
function applyDarkMode(isDark) {
    document.documentElement.classList.toggle("dark", isDark);
    darkToggle.textContent = isDark ? "☀ Light" : "☾ Dark";
}
let isDark = localStorage.getItem(DARK_MODE_KEY) === "true";
applyDarkMode(isDark);
darkToggle.addEventListener("click", () => {
    isDark = !isDark;
    localStorage.setItem(DARK_MODE_KEY, String(isDark));
    applyDarkMode(isDark);
});
updatePreview();
export {};
