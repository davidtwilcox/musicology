# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Musicology is an interactive web application for exploring music theory concepts. It is a static site with no build step, no dependencies, and no test framework.

## Development

Open `index.html` directly in a browser (`start index.html` on Windows). There is no build, lint, or test command. Verify changes visually in the browser.

## Architecture

The app is a single self-contained `index.html` file with inline CSS and JavaScript (no external dependencies). The UI is organized into tabs (Keys, Scales, Chords), each a `.tab-content` pane toggled by the `.tab-bar` nav.

### Keys tab (Circle of Fifths)

Key design patterns in the JavaScript:
- **Data model**: The `KEYS` array maps circle positions (0–11, clockwise from C at top) to major/minor key names, key signature counts, and accidental types. `MAJOR_SCALES` holds the 7-note scale for each position.
- **Chord computation**: `getChords(ring, pos)` derives all 7 diatonic chords for a key by computing circle-position offsets — no hardcoded chord tables. Major chords use positions `pos, pos±1, pos+2`; minor chords mirror this pattern.
- **Scale & chord tones**: `getScale(ring, pos)` returns the 7-note scale (major or natural minor). `getChordTones(ring, pos, chordIdx)` uses `CHORD_DEGREES` to extract the triad notes and pairs them with `INTERVAL_NAMES` by quality.
- **SVG rendering**: The circle uses `<path>` arcs from `arcPath()`. The staff (`renderStaffSvg(notes, compact)`) and piano keyboard (`renderPianoSvg`) are generated as inline SVG strings inserted via `innerHTML`. `renderStaffSvg` handles both scale mode (octave tracking) and chord mode (`compact=true`, offset from root).
- **Selection state**: `selectedRing` ('major'/'minor') and `selectedPos` (0–11) drive all visual updates. Clicking the same key toggles off. `activeChordIdx` tracks which chord's tones are shown (set by clicking a row in the diatonic chords table).
- **Collapsible sections**: Each `.info-section` in the Keys tab info panel (Key Signature, Scale Notes, Key Relationships, Diatonic Chords, Chord Borrowing) is collapsible. The `h3` header contains a `.collapse-indicator` (▼) and toggles the `.collapsed` class on click. Content is wrapped in `.info-section-content > div` and animated via CSS `grid-template-rows`. The Scales tab result section also uses this pattern.
- **Chord Borrowing section**: Contains three sub-sections — Parallel, Modal Interchange, and Secondary Dominants. Each uses a `.borrowing-table` (7-column layout matching diatonic degrees) with clickable chord cells. Chord selections across all sub-sections and the Diatonic Chords table are mutually exclusive, managed by `clearAllChordSelections()`.
  - **Parallel**: Shows current key chords vs. parallel key chords. Uses `getChords(parRing, parPos)` and `showBorrowedChordTones()` for display.
  - **Modal Interchange**: `getModalChords(tonic, modeName)` computes triads for each mode by building the scale via `computeScaleNotes`, then determining chord quality from semitone intervals (`noteToSemitone`). Shows 7 mode rows; the current mode (Ionian for major, Aeolian for minor) is labeled "Current" and moved to the top. `showModalChordTones()` displays tones in `#modal-chord-tones`.
  - **Secondary Dominants**: `computeSecondaryDominant(targetRoot)` finds the perfect 5th above the target root (letter-based computation for correct spelling), builds a major triad via `computeScale` with `triadOffsets [0, 2, 4]`, and remaps enharmonically (B♯→C, E♯→F, A♯→B♭, D♯→E♭) when `hasDoubleAccidental` detects double sharps. Shows V/x for each diatonic degree. `showSecDomChordTones()` and `showSecDomCurrentTones()` display tones in `#secdom-chord-tones`.
- **Shared chord-tone rendering**: `renderChordToneDisplay(container, title, tones, color)` is the single renderer for all chord-tone display panels (diatonic, borrowed, modal, secondary dominant). All five `show*` functions delegate to it.

### Scales tab

- **Data**: `CHROMATIC_TONES` (12 tones, C–B using sharps). `SCALE_TYPES` (18 types: 4 common scales + 7 modes + 7 other). `SCALE_INTERVALS` maps each type to its semitone interval pattern from the root. `ENHARMONIC_FLAT` remaps D♯/G♯/A♯ to E♭/A♭/B♭ when needed. Non-heptatonic scales are supported: whole tone (6 notes), diminished (8 notes), pentatonic (5 notes).
- **Scale computation**: `computeScale(tonic, intervals, letterOffsets)` derives note names algorithmically — uses `letterOffsets` (if provided) to assign the correct diatonic letter per degree and adds accidentals (♯, ♭, ♯♯, ♭♭) to match the target semitone. For heptatonic scales `letterOffsets` is omitted and consecutive letters are assumed. `SCALE_LETTER_OFFSETS` provides explicit letter offset arrays for pentatonic and diminished scales. The diminished scale (8 notes) uses `[0,1,2,3,4,5,5,6]` to repeat the 6th letter, minimizing double accidentals. `hasDoubleAccidental(tonic, intervals, letterOffsets)` delegates to `computeScale` and checks for notes with double accidentals (length > 2). `computeScaleNotes(tonic, scaleType)` calls `hasDoubleAccidental` and automatically uses the enharmonic flat tonic when double accidentals would occur.
- **Selection state**: `selectedTonic` and `selectedScaleType` are independent. `updateScaleBlocks()` refreshes button highlights and, when both are set, calls `renderScaleResult()` to display the scale notes, staff SVG, and piano SVG in `#scale-result`.
- **UI building**: `buildScalesTab()` creates `.scale-block` buttons for each tonic and scale type, inserting `.scales-type-separator` divs before Ionian (index 4, labeled "Modes") and before Phrygian dominant (index 11, labeled "Other").
- **Staff rendering**: `renderStaffSvg(notes, compact)` uses letter-based staff positioning (`STAFF_IDX` + octave tracking for scales, offset from root for chords when `compact=true`). Accidentals are extracted via `substring(1)` to handle single and double accidentals. `LETTER_NAMES` and `LETTER_SEMITONES` are module-level constants shared across `computeScale`, `computeSecondaryDominant`, and `hasDoubleAccidental`. `DEGREE_COLORS` provides the ordered degree-color array for chord-tone display.

## Music Theory Conventions

- Outer ring = major keys; inner ring = relative minor keys (same key signature).
- Parallel key: same root, opposite quality. Offset: major→minor is `(pos+9)%12`, minor→major is `(pos+3)%12`.
- Augmented chords use the root note + '+' suffix. `INTERVAL_NAMES` includes an 'Augmented' entry for Root / Major Third / Augmented Fifth.
- Diminished chords (vii° in major, ii° in minor) use the minor key name with 'm' replaced by '°'.
- Enharmonic keys at positions 5–7 (B/C♭, F♯/G♭, D♭/C♯) need special handling — see `stripMinor()` for slash-delimited names.
- Staff rendering maps note letters to diatonic staff positions (C=0 through A=5, B=-1). Each scale step increments by one position; accidentals don't affect vertical placement.
- Piano keyboard maps notes to chromatic semitone values (C=0, D=2, ... B=11, each ♯ adds 1, each ♭ subtracts 1). `noteToSemitone` counts all accidental characters, supporting double sharps/flats. Octave wrapping is detected when a note's semitone is ≤ the previous note's.
- Scale degree spelling: each degree uses the next diatonic letter name in sequence. D♯, G♯, and A♯ are silently remapped to their flat enharmonics (E♭, A♭, B♭) for scale types that would otherwise require double sharps — detected dynamically by `hasDoubleAccidental`.
