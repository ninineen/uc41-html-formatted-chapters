# Unprofessional Conduct in the 41st — HTML-Formatted Chapters

HTML-formatted chapters of *Unprofessional Conduct in the 41st*, my Disco Elysium fanfic on AO3. Marked up for the `ao3-adaptive-disco-elysium-workskin` skill check styling — readable across light mode, Ao3Reversi theme, desktop, and mobile.

This repo is for version control of my own chapters. Not a template, not free to reuse.

---

## Connect with me

**Support my work:** [Buy me a coffee on Ko-fi](https://ko-fi.com/ninineen)

I make AO3 skins, stream on Twitch, and post fandom content across socials. Find me here:

<p align="left">
  <a href="https://archiveofourown.org/users/ninineen/profile" target="_blank"><img src="https://img.shields.io/badge/AO3-990000?style=flat-square&logo=archiveofourown&logoColor=white" alt="AO3"></a>
  <a href="https://twitch.tv/ninineen" target="_blank"><img src="https://img.shields.io/badge/Twitch-9146FF?style=flat-square&logo=twitch&logoColor=white" alt="Twitch"></a>
  <a href="https://bsky.app/profile/ninineen.bsky.social" target="_blank"><img src="https://img.shields.io/badge/Bluesky-0285FF?style=flat-square&logo=bluesky&logoColor=white" alt="Bluesky"></a>
  <a href="https://ko-fi.com/ninineen" target="_blank"><img src="https://img.shields.io/badge/Ko--fi-F16061?style=flat-square&logo=kofi&logoColor=white" alt="Ko-fi"></a>
  <a href="https://discord.gg/ninineen" target="_blank"><img src="https://img.shields.io/badge/Discord-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
</p>

---

## Usage

> **Run all commands from WSL**, not Windows. `live-server` and `ts-node` are installed in the WSL environment — open a terminal in Ubuntu and `cd` to the project root before running anything.

### Format a chapter

Transforms a raw HTML chapter file and writes a `.formatted.html` alongside it, wrapping skill-check lines in the correct `de-convo` / `de-skill` / `de-check` spans.

```bash
npm run format -- chapters/ch2.html
# → writes chapters/ch2.formatted.html
```

### Preview locally

Builds everything into `build/` and opens a live-reloading local server. The preview renders inside the real AO3 stylesheet + the Disco Elysium workskin.

```bash
npm start
# → http://127.0.0.1:8080/build/preview.html
```

Use the **chapter dropdown** to load a formatted chapter, or **Load file** to pick any `.html` from disk. The **☾/☀ toggle** switches between dark and light backgrounds.

To add a newly formatted chapter to the dropdown, edit the `CHAPTERS` array in `ao3-preview/src/ts/preview.ts`, then rebuild.

To rebuild without starting the server:

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

---

## Read it on AO3

**[Read *Unprofessional Conduct in the 41st* on AO3 →](https://archiveofourown.org/works/84782906/chapters/229473821)**

---

## License

All rights reserved. © NiniNeen.

This is my original fanwork. The text of these chapters is **not** licensed for reuse, redistribution, adaptation, or republication anywhere, in whole or in part. Please do not copy, repost, or scrape this work. Not affiliated with ZA/UM.

---