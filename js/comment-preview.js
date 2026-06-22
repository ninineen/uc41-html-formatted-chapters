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
const commentContent = document.getElementById("comment-content");
const sourceInput = document.getElementById("source-input");
const clearBtn = document.getElementById("clear-btn");
const copyHtmlBtn = document.getElementById("copy-html-btn");
const warningBar = document.getElementById("warning-bar");
const sanitizedBadge = document.getElementById("sanitized-badge");
const darkToggle = document.getElementById("dark-toggle");
const previewScroll = document.getElementById("preview-scroll");
const tabs = document.querySelectorAll(".preview-tab");
// ── Quill ──────────────────────────────────────────────
const quill = new Quill("#quill-editor", {
    theme: "snow",
    placeholder: "Write your comment here…",
    modules: {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ script: "sub" }, { script: "super" }],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
        ],
    },
});
// When Quill pastes a plain text node that looks like raw HTML,
// convert it to rendered HTML instead of inserting it as literal text.
quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
    const text = node.data;
    if (/<[a-z][\s\S]*>/i.test(text)) {
        return quill.clipboard.convert({ html: text });
    }
    return delta;
});
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
function applyWarnings(removedTags, removedAttrs) {
    const warningText = buildWarningText(removedTags, removedAttrs);
    const hasWarnings = warningText.length > 0;
    warningBar.textContent = hasWarnings ? `Stripped: ${warningText}` : "";
    warningBar.style.display = hasWarnings ? "block" : "none";
    sanitizedBadge.style.display = hasWarnings ? "inline" : "none";
}
// ── sync logic ─────────────────────────────────────────
let updating = false;
function getEditorHtml() {
    const inner = quill.root.innerHTML;
    if (inner === "<p><br></p>")
        return "";
    // Quill appends a trailing <br> inside every block element — strip them.
    return inner.replace(/<br\s*\/?>\s*(<\/(?:p|li|h[1-6]|blockquote|td|th)>)/gi, "$1");
}
function updateFromEditor() {
    if (updating)
        return;
    updating = true;
    const { clean, removedTags, removedAttrs } = sanitizeAndCollectStripped(getEditorHtml());
    commentContent.innerHTML = clean;
    sourceInput.value = clean;
    applyWarnings(removedTags, removedAttrs);
    updating = false;
}
function updateFromSource() {
    if (updating)
        return;
    updating = true;
    const raw = sourceInput.value;
    const { clean, removedTags, removedAttrs } = sanitizeAndCollectStripped(raw);
    commentContent.innerHTML = clean;
    const delta = quill.clipboard.convert({ html: raw });
    quill.setContents(delta, "silent");
    applyWarnings(removedTags, removedAttrs);
    updating = false;
}
quill.on("text-change", (_delta, _old, source) => {
    if (source === "silent")
        return;
    updateFromEditor();
});
sourceInput.addEventListener("input", updateFromSource);
// ── tab switching ──────────────────────────────────────
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        if (tab.dataset["tab"] === "source") {
            previewScroll.style.display = "none";
            sourceInput.style.display = "block";
            sourceInput.focus();
        }
        else {
            previewScroll.style.display = "";
            sourceInput.style.display = "none";
        }
    });
});
// ── clear ──────────────────────────────────────────────
copyHtmlBtn.addEventListener("click", async () => {
    const { clean } = sanitizeAndCollectStripped(getEditorHtml());
    await navigator.clipboard.writeText(clean);
    const orig = copyHtmlBtn.textContent;
    copyHtmlBtn.textContent = "Copied!";
    setTimeout(() => { copyHtmlBtn.textContent = orig; }, 1500);
});
clearBtn.addEventListener("click", () => {
    quill.setText("");
    sourceInput.value = "";
    commentContent.innerHTML = "";
    quill.focus();
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
updateFromEditor();
export {};
