# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Musicology is an interactive web application for exploring music theory concepts. It is a static site with no build step, no dependencies, and no test framework.

## Development

Open `index.html` directly in a browser (`start index.html` on Windows). There is no build, lint, or test command. Verify changes visually in the browser.

## Architecture

The app is a single self-contained `index.html` file with inline CSS and JavaScript (no external dependencies). Each music theory concept (currently: Circle of Fifths) is an interactive SVG-based visualization with an accompanying info panel.

Key design patterns in the JavaScript:
- **Data model**: The `KEYS` array maps circle positions (0–11, clockwise from C at top) to major/minor key names, key signature counts, and accidental types. `MAJOR_SCALES` holds the 7-note scale for each position.
- **Chord computation**: `getChords(ring, pos)` derives all 7 diatonic chords for a key by computing circle-position offsets — no hardcoded chord tables. Major chords use positions `pos, pos±1, pos+2`; minor chords mirror this pattern.
- **Scale & chord tones**: `getScale(ring, pos)` returns the 7-note scale (major or natural minor). `getChordTones(ring, pos, chordIdx)` uses `CHORD_DEGREES` to extract the triad notes and pairs them with `INTERVAL_NAMES` by quality.
- **SVG rendering**: The circle uses `<path>` arcs from `arcPath()`. The staff (`renderStaffSvg`) and piano keyboard (`renderPianoSvg`) are generated as inline SVG strings inserted via `innerHTML`.
- **Selection state**: `selectedRing` ('major'/'minor') and `selectedPos` (0–11) drive all visual updates. Clicking the same key toggles off. `highlightedChordMap` maps `ring_pos` keys to chord indices so circle hover can trigger chord tone display. `activeChordIdx` tracks which chord's tones are shown.

## Music Theory Conventions

- Outer ring = major keys; inner ring = relative minor keys (same key signature).
- Parallel key: same root, opposite quality. Offset: major→minor is `(pos+9)%12`, minor→major is `(pos+3)%12`.
- Diminished chords (vii° in major, ii° in minor) use the minor key name with 'm' replaced by '°'.
- Enharmonic keys at positions 5–7 (B/C♭, F♯/G♭, D♭/C♯) need special handling — see `stripMinor()` for slash-delimited names.
- Staff rendering maps note letters to diatonic staff positions (C=0 through A=5, B=-1). Each scale step increments by one position; accidentals don't affect vertical placement.
- Piano keyboard maps notes to chromatic semitone values (C=0, D=2, ... B=11, ♯ adds 1, ♭ subtracts 1). Octave wrapping is detected when a note's semitone is ≤ the previous note's.
