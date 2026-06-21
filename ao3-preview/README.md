# AO3 Chapter Previewer

Local preview for formatted chapters. Renders them inside the real AO3 stylesheet + the Disco Elysium workskin so what you see matches what AO3 shows.

---

## Setup & running

From the project root in WSL:

```bash
npm start
```

This builds the project into `build/` (compiles TypeScript, copies HTML/CSS) then starts a local server. The preview opens automatically at `http://127.0.0.1:8080/build/preview.html`.

To rebuild without starting the server:

```bash
npm run build
```

> **Run from WSL, not Windows.** `live-server` is installed in the WSL environment. Open your terminal in Ubuntu and `cd` to the project root before running npm commands.

---

## Using the previewer

- **Chapter dropdown** — select a formatted chapter to load it.
- **Load file** — pick any `.html` file from disk without needing the dropdown (no server required for this).
- **☾ Dark / ☀ Light toggle** — switches between light and dark backgrounds to check both modes.

---

## Adding chapters to the dropdown

Edit the `CHAPTERS` array in `ao3-preview/ts/preview.ts`:

```ts
const CHAPTERS: Chapter[] = [
  { label: "ch7 (formatted)", path: "../chapters/ch7.formatted.html" },
  { label: "ch8 (formatted)", path: "../chapters/ch8.formatted.html" },
];
```

Paths are relative to the served `build/preview.html`, so `../chapters/` points to the project root's `chapters/` folder. Run `npm run build` (or `npm start`) to pick up the change.

---

## Manual markup — skill colour without a label

For moments where a skill bleeds onto the page as raw text (breaking the established formatting intentionally), wrap the content in a bare `de-skill` span — no `de-convo`, no label, no bracket:

```html
<p><span class="de-skill electrochemistry"><strong><em>Him.</em> <em>Take him.</em> <em>He is the substance.</em></strong></span></p>
```

This gives the text the skill's colour only. Works with any skill class. Any inline formatting (`<strong>`, `<em>`, etc.) goes inside the span.

---

## Generating a formatted chapter

From the project root:

```bash
npx ts-node scripts/format.ts chapters/chN.html
```

Outputs `chapters/chN.formatted.html`. Add it to the `CHAPTERS` array in `ts/preview.ts` and run `npm run build` to make it appear in the dropdown.
