import { skillClass, checkClass, transformLine } from "./format";

// ---------------------------------------------------------------------------
// skillClass
// ---------------------------------------------------------------------------

describe("skillClass", () => {
  it("returns the correct class for a known skill", () => {
    expect(skillClass("VOLITION")).toBe("volition");
    expect(skillClass("INLAND EMPIRE")).toBe("inland-empire");
    expect(skillClass("HALF-LIGHT")).toBe("half-light");
    expect(skillClass("PAIN THRESHOLD")).toBe("pain-threshold");
    expect(skillClass("PHYSICAL INSTRUMENT")).toBe("physical-instrument");
    expect(skillClass("VISUAL CALCULUS")).toBe("visual-calculus");
    expect(skillClass("ESPRIT DE CORPS")).toBe("esprit-de-corps");
    expect(skillClass("SAVOIR FAIRE")).toBe("savoir-faire");
    expect(skillClass("REACTION SPEED")).toBe("reaction-speed");
    expect(skillClass("ANCIENT REPTILIAN BRAIN")).toBe("ancient-reptilian-brain");
  });

  it("strips parenthetical sub-skill suffix before lookup", () => {
    expect(skillClass("PERCEPTION (HEARING)")).toBe("perception");
    expect(skillClass("PERCEPTION (SIGHT)")).toBe("perception");
    expect(skillClass("PERCEPTION (Touch)")).toBe("perception");
    expect(skillClass("PERCEPTION (Smell)")).toBe("perception");
    expect(skillClass("PERCEPTION (TOUCH)")).toBe("perception");
  });

  it("returns null for an unrecognised label", () => {
    expect(skillClass("He has not let go.")).toBeNull();
    expect(skillClass("NOT A SKILL")).toBeNull();
  });

  it("returns null for bold-italic prose fragments", () => {
    expect(skillClass("Him.")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkClass
// ---------------------------------------------------------------------------

describe("checkClass", () => {
  it("returns success for standard success", () => {
    expect(checkClass("Trivial: Success")).toBe("success");
    expect(checkClass("Easy: Success")).toBe("success");
    expect(checkClass("Formidable: Success")).toBe("success");
  });

  it("returns success for Critical Success", () => {
    expect(checkClass("Godly: Critical Success")).toBe("success");
  });

  it("returns failure for standard failure", () => {
    expect(checkClass("Easy: Failure")).toBe("failure");
    expect(checkClass("Impossible: Failure")).toBe("failure");
    expect(checkClass("Trivial: Failure")).toBe("failure");
  });

  it("returns the correct class when bracket contains an annotation", () => {
    expect(checkClass("Formidable: Failure — <em>trying</em>")).toBe("failure");
    expect(checkClass("Trivial: Failure — <em>too late</em>")).toBe("failure");
    expect(checkClass("Trivial: Success — <em>too late</em>")).toBe("success");
    expect(checkClass("Impossible: Failure — <em>reaffirmed</em>")).toBe("failure");
  });

  it("returns null for the empty dash placeholder", () => {
    expect(checkClass("—")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// transformLine — pass-through cases
// ---------------------------------------------------------------------------

describe("transformLine — pass-through", () => {
  it("leaves plain prose paragraphs unchanged", () => {
    const line = "<p>The apartment smelled of moving air, rinsed clean.</p>";
    expect(transformLine(line)).toBe(line);
  });

  it("leaves italic-only paragraphs unchanged", () => {
    const line = "<p><em>Detective.</em></p>";
    expect(transformLine(line)).toBe(line);
  });

  it("leaves hr tags unchanged", () => {
    expect(transformLine("<hr>")).toBe("<hr>");
  });

  it("leaves bold prose that is not a skill name unchanged", () => {
    expect(transformLine("<p><strong>He has not let go.</strong></p>")).toBe(
      "<p><strong>He has not let go.</strong></p>"
    );
  });

  it("leaves bold-italic prose unchanged", () => {
    const line =
      "<p><strong><em>Him.</em>  <em>Take him.</em> <em>He is the substance.</em></strong></p>";
    expect(transformLine(line)).toBe(line);
  });
});

// ---------------------------------------------------------------------------
// transformLine — skill checks
// ---------------------------------------------------------------------------

describe("transformLine — skill checks", () => {
  it("transforms a basic success check", () => {
    const input =
      '<p><strong>PERCEPTION</strong> [Trivial: Success] — <em>Bleach and clean dish soap.</em></p>';
    const output = transformLine(input);
    expect(output).toContain('class="de-convo"');
    expect(output).toContain('<span class="de-skill perception">PERCEPTION</span>');
    expect(output).toContain('<span class="de-check success">[Trivial: Success]</span>');
    expect(output).toContain(' — <em>Bleach and clean dish soap.</em>');
  });

  it("transforms a basic failure check", () => {
    const input =
      '<p><strong>VOLITION</strong> [Easy: Failure] — <em>Not this.</em></p>';
    const output = transformLine(input);
    expect(output).toContain('<span class="de-check failure">[Easy: Failure]</span>');
    expect(output).toContain('<span class="de-skill volition">VOLITION</span>');
  });

  it("transforms Critical Success to success class", () => {
    const input =
      '<p><strong>EMPATHY</strong> [Godly: Critical Success] — <em>He is not horrified.</em></p>';
    const output = transformLine(input);
    expect(output).toContain('<span class="de-check success">[Godly: Critical Success]</span>');
  });

  it("preserves annotation inside the bracket", () => {
    const input =
      '<p><strong>VOLITION</strong> [Formidable: Failure — <em>trying</em>] — <em>No. Not this.</em></p>';
    const output = transformLine(input);
    expect(output).toContain(
      '<span class="de-check failure">[Formidable: Failure — <em>trying</em>]</span>'
    );
  });

  it("trims stray trailing space inside bracket", () => {
    const input =
      '<p><strong>EMPATHY</strong> [Impossible: Failure ] — <em>He recoiled.</em></p>';
    const output = transformLine(input);
    expect(output).toContain('[Impossible: Failure]');
    expect(output).not.toContain('[Impossible: Failure ]');
  });

  it("preserves sub-skill display text while using base class", () => {
    const input =
      '<p><strong>PERCEPTION (HEARING)</strong> [Trivial: Success] — <em>His breath.</em></p>';
    const output = transformLine(input);
    expect(output).toContain('<span class="de-skill perception">PERCEPTION (HEARING)</span>');
  });

  it("handles [—] with body (no-roll, has inner monologue)", () => {
    const input =
      '<p><strong>VOLITION</strong> [—] — <em>Harry —</em></p>';
    const output = transformLine(input);
    expect(output).toContain('class="de-convo"');
    expect(output).toContain('[—]');
    expect(output).not.toContain('de-check');
    expect(output).toContain(' — <em>Harry —</em>');
  });

  it("handles stub [—] with no body", () => {
    const input = '<p><strong>VOLITION</strong> [—]</p>';
    const output = transformLine(input);
    expect(output).toContain('class="de-convo"');
    expect(output).toContain('[—]');
    expect(output).not.toContain('de-check');
  });

  it("handles mood tag between bracket and separator", () => {
    const input =
      '<p><strong>HALF-LIGHT</strong> [Medium: Success], cackling — <em>Yes! Good!</em></p>';
    const output = transformLine(input);
    expect(output).toContain('<span class="de-check success">[Medium: Success]</span>');
    expect(output).toContain(', cackling — <em>Yes! Good!</em>');
  });

  it("handles long mood tag on a [—] no-roll line", () => {
    const input =
      '<p><strong>ENCYCLOPEDIA</strong> [—], faint, far off, as though the wire has gone bad — <em>Taiga Super Special.</em></p>';
    const output = transformLine(input);
    expect(output).toContain('[—]');
    expect(output).toContain(', faint, far off, as though the wire has gone bad — <em>Taiga Super Special.</em>');
    expect(output).not.toContain('de-check');
  });

  it("handles plain (non-italic) body text", () => {
    const input = '<p><strong>SHIVERS</strong> [—] — THE DOOR IS CLOSED.</p>';
    const output = transformLine(input);
    expect(output).toContain(' — THE DOOR IS CLOSED.');
  });

  it("uses correct classes for multi-word skills", () => {
    expect(transformLine('<p><strong>INLAND EMPIRE</strong> [Easy: Success] — <em>Someone is missing.</em></p>'))
      .toContain('de-skill inland-empire');
    expect(transformLine('<p><strong>PAIN THRESHOLD</strong> [—] — <em>Hurt is an old room.</em></p>'))
      .toContain('de-skill pain-threshold');
    expect(transformLine('<p><strong>ESPRIT DE CORPS</strong> [Easy: Success] — <em>Five minutes away.</em></p>'))
      .toContain('de-skill esprit-de-corps');
    expect(transformLine('<p><strong>PHYSICAL INSTRUMENT</strong> [—] — <em>The body remembers.</em></p>'))
      .toContain('de-skill physical-instrument');
    expect(transformLine('<p><strong>VISUAL CALCULUS</strong> [—] — <em>Distance to counter.</em></p>'))
      .toContain('de-skill visual-calculus');
  });
});
