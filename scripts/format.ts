import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Skill name → CSS class
// ---------------------------------------------------------------------------

const SKILL_CLASS: Record<string, string> = {
  "LOGIC": "logic",
  "ENCYCLOPEDIA": "encyclopedia",
  "RHETORIC": "rhetoric",
  "DRAMA": "drama",
  "CONCEPTUALIZATION": "conceptualization",
  "VISUAL CALCULUS": "visual-calculus",
  "VOLITION": "volition",
  "INLAND EMPIRE": "inland-empire",
  "EMPATHY": "empathy",
  "AUTHORITY": "authority",
  "ESPRIT DE CORPS": "esprit-de-corps",
  "SUGGESTION": "suggestion",
  "ENDURANCE": "endurance",
  "PAIN THRESHOLD": "pain-threshold",
  "PHYSICAL INSTRUMENT": "physical-instrument",
  "ELECTROCHEMISTRY": "electrochemistry",
  "SHIVERS": "shivers",
  "HALF-LIGHT": "half-light",
  "HAND-EYE COORDINATION": "hand-eye-coordination",
  "PERCEPTION": "perception",
  "REACTION SPEED": "reaction-speed",
  "SAVOIR FAIRE": "savoir-faire",
  "INTERFACING": "interfacing",
  "COMPOSURE": "composure",
  "ANCIENT REPTILIAN BRAIN": "ancient-reptilian-brain",
  "LIMBIC SYSTEM": "limbic-system",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Given the raw skill label from inside <strong>…</strong>, return the CSS
 * class, or null if the label is not a recognised skill name.
 * Sub-skills like "PERCEPTION (HEARING)" map to "perception".
 */
export function skillClass(label: string): string | null {
  // Strip parenthetical suffix: "PERCEPTION (HEARING)" → "PERCEPTION"
  const base = label.replace(/\s*\(.*\)$/, "").trim();
  const cls = SKILL_CLASS[base];
  if (!cls) return null;
  return cls;
}

/**
 * Determine success/failure class from the bracket content.
 * Returns "success" | "failure" | null (for [—] or unrecognised).
 */
export function checkClass(bracketInner: string): "success" | "failure" | null {
  // bracketInner is the text between [ and ] (trimmed), e.g.
  // "Trivial: Success", "Formidable: Failure — <em>trying</em>", "—"
  if (bracketInner === "—") return null;
  // Match "…: Success" or "…: Critical Success" (case-insensitive)
  if (/:\s*(critical\s+)?success/i.test(bracketInner)) return "success";
  if (/:\s*failure/i.test(bracketInner)) return "failure";
  return null;
}

// ---------------------------------------------------------------------------
// Line transformer
// ---------------------------------------------------------------------------

/**
 * Attempt to transform a single line. Returns the transformed string, or the
 * original line unchanged if it doesn't match the skill-check pattern.
 *
 * Input pattern (single line):
 *   <p><strong>SKILL NAME</strong> [bracket] optional mood tag — body</p>
 *   <p><strong>SKILL NAME</strong> [—]</p>   ← stub: no body
 *
 * Output:
 *   <p class="de-convo"><span class="de-skill cls">SKILL NAME</span>
 *   <span class="de-check success|failure">[bracket]</span> mood — body</p>
 */
export function transformLine(line: string): string {
  // Must start with <p> and contain a <strong>…</strong> skill label
  const skillMatch = line.match(
    /^<p>(<strong>(.+?)<\/strong>)([\s\S]*)(<\/p>)$/
  );
  if (!skillMatch) return line;

  const [, , rawLabel, rest, closeTag] = skillMatch;
  const cls = skillClass(rawLabel);
  if (!cls) return line; // bold prose, not a skill check

  // rest is everything after </strong> and before </p>
  // Possible shapes:
  //   (empty)
  //   " [—]"
  //   " [Trivial: Success] — <em>…</em>"
  //   " [Formidable: Failure — <em>trying</em>], cackling — <em>…</em>"
  //   " [—] — (still silent. but moving.)"
  //   " [—], faint, far off… — <em>…</em>"

  const trimmedRest = rest.trimStart(); // leading space after </strong>

  if (!trimmedRest) {
    // No bracket at all — unusual, pass through raw
    return line;
  }

  // Extract bracket: everything from the opening [ to the matching ]
  // We need to handle nested HTML inside the bracket, e.g. <em>trying</em>
  const bracketStart = trimmedRest.indexOf("[");
  if (bracketStart !== 0) {
    // Doesn't start with [ — not a skill check paragraph we recognise
    return line;
  }

  // Walk forward to find matching ] (not nested, brackets don't nest in DE)
  const bracketEnd = trimmedRest.indexOf("]");
  if (bracketEnd === -1) return line;

  const rawBracket = trimmedRest.slice(1, bracketEnd); // content between [ and ]
  const trimmedBracket = rawBracket.trim();             // normalise stray spaces

  // Everything after the ]
  const afterBracket = trimmedRest.slice(bracketEnd + 1); // e.g. " — body" or ", mood — body" or ""

  // Determine check class
  const chkCls = checkClass(trimmedBracket);

  // Build check span (or plain [—] text for stubs/no-rolls)
  let checkPart: string;
  if (chkCls) {
    checkPart = `<span class="de-check ${chkCls}">[${trimmedBracket}]</span>`;
  } else {
    // [—] or unknown — emit as plain text
    checkPart = `[${trimmedBracket}]`;
  }

  // Split afterBracket into optional mood tag and body
  // The separator between mood and body is " — " (space + em-dash + space)
  // But we must find the FIRST " — " that isn't inside the bracket (already consumed)
  const sepIdx = afterBracket.indexOf(" — "); // " — "
  let moodPart = "";
  let bodyPart = "";

  if (sepIdx === -1) {
    // No separator → stub (e.g. [—] alone, or [—] with only mood and no body)
    moodPart = afterBracket; // could be ", faint…" with no body; unusual but keep
    bodyPart = "";
  } else {
    moodPart = afterBracket.slice(0, sepIdx);   // e.g. "" or ", cackling"
    bodyPart = afterBracket.slice(sepIdx);       // e.g. " — <em>…</em>"
  }

  // Assemble output
  const skillSpan = `<span class="de-skill ${cls}">${rawLabel}</span>`;

  // Body: keep the " — " prefix so it reads naturally
  const body = bodyPart; // already starts with " — " if present

  return `<p class="de-convo">${skillSpan} ${checkPart}${moodPart}${body}${closeTag}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    process.stderr.write("Usage: ts-node format.ts <input.html>\n");
    process.exit(1);
  }

  const absInput = path.resolve(inputPath);
  if (!fs.existsSync(absInput)) {
    process.stderr.write(`File not found: ${absInput}\n`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absInput, "utf8");

  // Process line by line to keep unchanged lines identical
  const lines = raw.split("\n");
  const out = lines.map(transformLine).join("\n");

  const ext = path.extname(absInput);
  const base = absInput.slice(0, -ext.length);
  const outputPath = `${base}.formatted${ext}`;

  fs.writeFileSync(outputPath, out, "utf8");
  process.stdout.write(`Written: ${outputPath}\n`);
}

if (require.main === module) main();
