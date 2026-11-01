# Musicology

An interactive web application for exploring music theory concepts.

## Keys

An interactive **Circle of Fifths** visualization. Click any major or minor key to see:

- **Diatonic chords** highlighted on the circle with Roman numeral labels (I, ii, iii, IV, V, vi, vii°)
- **Scale notes** displayed as text, on a treble clef staff, and on a piano keyboard with highlighted keys
- **Chord tones** — click any chord (in the diatonic table, borrowed chords, modal interchange, or secondary dominants) to see its notes and intervals in a dedicated Chord Information panel
- **Key signature** details (number and names of sharps or flats)
- **Relative key** (shares the same key signature)
- **Parallel key** (shares the same root note, opposite quality)
- **Chord Borrowing** — explore chords borrowed from related keys and modes:
  - **Parallel key** chords side-by-side with the current key
  - **Modal interchange** chords from all seven modes (Ionian through Locrian)
  - **Secondary Dominants & Tritone Substitution** — for each diatonic degree: the diatonic chord, its secondary dominant (V7/), and the tritone substitution (♭II7/)
- **Chromatic Mediants** — the 6 chromatic mediants of the selected key, split into Upper (a 3rd above the tonic) and Lower (a 3rd below the tonic) groups; click any to see its notes and intervals

Chord Borrowing and Chromatic Mediants start collapsed. Select their headings to expand them.

## Scales

A **Scale Explorer** for any combination of tonic and scale type. Select a tonic (all 12 chromatic tones) and a scale type to see:

- **Scale notes** displayed as a text sequence
- **Staff notation** on a treble clef staff
- **Piano keyboard** with the scale notes highlighted
- **Guitar fretboard** showing all scale positions across 12 frets, with tuning selector (Standard, Drop D, DADGAD, All Fourths, All Fourths (Tuned Down), Major 3rds)
- **Bass guitar fretboard** showing all scale positions across 12 frets (standard tuning)

Scale types available:
- Major, Natural minor, Harmonic minor, Melodic minor
- Modes: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
- Other: Phrygian dominant, Hungarian minor, Ukrainian Dorian, Whole tone, Diminished, Major pentatonic, Minor pentatonic

## Chords

A **Chord Explorer** for any combination of root note, chord type, and inversion. Select a root and type to see:

- **Chord notes** displayed as a text sequence
- **Staff notation** on a treble clef staff
- **Piano keyboard** with the chord notes highlighted
- **Inversions** — Root (default), First, Second, and Third inversion; Third is only enabled for four-note chords (tetrads), and First/Second are disabled for power chords
- **Guitar fretboard** — shows all chord-tone positions across the neck; a position selector (All / 1–5) lets you zoom into any of the five standard neck positions; a tuning selector switches between Standard, Drop D, DADGAD, All Fourths, All Fourths (Tuned Down), and Major 3rds

Chord types available:
Major, Minor, 7th, 5th, Diminished, Diminished 7th, Augmented, Suspended 2nd, Suspended 4th, Major 7th, Minor 7th, Major 6th, 7th Suspended 4th

## Progressions

Choose a tonic, a scale type or mode, and a chord progression. The selectors use the same options and styling as the Scales tab.

- **Compatible progressions** — progressions are disabled when any required chord tone falls outside the selected scale, including the seventh in V7. Changing scales clears a selected progression if it is no longer compatible.
- **Chord table** — shows each chord in order, with its numeral, name, quality, and scale degree.
- **Piano keyboards** — one keyboard per chord, with independent Root, First, and Second inversion controls; seventh chords also offer Third inversion.
- **Automatic ordering** — progressions compare from left to right, by chord number and then quality (major, minor, diminished) at each position. Accidentals and seventh extensions do not affect the chord number.

Progressions include I-V-vi-IV, I-vi-IV-V, i-iv-V7-i, i-v-♭VII-IV, i-VI-II-VII, i-VI-III-VII, i-VI-VII, i-VII-VI-V, and vi-IV-I-V. Bare numerals refer to degrees of the selected scale; ♭VII explicitly denotes the flattened seventh relative to major.

## Usage

Open `index.html` in a web browser. No build step or dependencies required.

## Development

The application is a single `index.html` file containing HTML, CSS, and JavaScript. There is no build step, dependency installation, or configured test runner. Open the file in a browser to verify changes.

See [AGENTS.md](AGENTS.md) for architecture, music-theory conventions, and contributor verification guidance. [CLAUDE.md](CLAUDE.md) points to that shared guidance.
