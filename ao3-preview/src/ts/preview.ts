const DARK_MODE_KEY = "ao3preview-dark";

interface Chapter {
  label: string;
  path: string;
}

const CHAPTERS: Chapter[] = [
  { label: "ch7 (formatted)", path: "../chapters/ch7.formatted.html" },
];

// ── DOM refs ───────────────────────────────────────────

const chapterSelect = document.getElementById("chapter-select") as HTMLSelectElement;
const filePicker    = document.getElementById("file-picker")    as HTMLInputElement;
const workskin      = document.getElementById("workskin")       as HTMLElement;
const darkToggle    = document.getElementById("dark-toggle")    as HTMLButtonElement;

// ── chapter select ─────────────────────────────────────

for (const { label, path } of CHAPTERS) {
  const opt = document.createElement("option");
  opt.value = path;
  opt.textContent = label;
  chapterSelect.appendChild(opt);
}

function renderChapter(html: string): void {
  workskin.innerHTML = `<div class="userstuff">${html}</div>`;
}

async function loadChapter(path: string): Promise<void> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(res.statusText);
    renderChapter(await res.text());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    workskin.innerHTML = `<p class="load-error">Could not load <code>${path}</code>: ${message}</p>`;
  }
}

chapterSelect.addEventListener("change", () => {
  if (chapterSelect.value) loadChapter(chapterSelect.value);
});

// ── file picker ────────────────────────────────────────

filePicker.addEventListener("change", () => {
  const file = filePicker.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => renderChapter(e.target?.result as string);
  reader.readAsText(file);
});

// ── dark mode ──────────────────────────────────────────

function applyDarkMode(isDark: boolean): void {
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
