const test = require('node:test');
const assert = require('node:assert/strict');
const loadApp = require('./helpers/load-app.cjs');
const app = loadApp();
const names = chords => Array.from(chords, chord => chord.name);

for (const [tonic, scale, progression, expected] of [
    ['C', 'Major', 'I-V-vi-IV', ['C', 'G', 'Am', 'F']],
    ['C', 'Natural minor', 'i-VI-III-VII', ['Cm', 'A♭', 'E♭', 'B♭']],
    ['C', 'Dorian', 'i-v-♭VII-IV', ['Cm', 'Gm', 'B♭', 'F']],
    ['A', 'Harmonic minor', 'i-iv-V7-i', ['Am', 'Dm', 'E7', 'Am']],
    ['D♯', 'Major', 'I-V-vi-IV', ['E♭', 'B♭', 'Cm', 'A♭']]
]) {
    test(`${progression} in ${tonic} ${scale}`, () => {
        assert.deepEqual(names(app.getProgressionChords(tonic, scale, progression)), expected);
    });
}

for (const [scale, progression] of [
    ['Major', 'i-VI-VII'],
    ['Natural minor', 'i-VI-II-VII'],
    ['Natural minor', 'i-iv-V7-i'],
    ['Harmonic minor', 'i-VI-VII'],
    ['Locrian', 'i-VI-VII'],
    ['Major pentatonic', 'I-V-vi-IV']
]) {
    test(`${scale} rejects incompatible ${progression}`, () => {
        assert.equal(app.getProgressionChords('C', scale, progression), null);
    });
}

test('V7 requires its minor seventh as well as a major triad', () => {
    assert(app.getProgressionChords('C', 'Major pentatonic', 'I'));
    assert.equal(app.getProgressionChords('C', 'Major pentatonic', 'I7'), null);
    const dominant = app.getProgressionChords('C', 'Harmonic minor', 'V7')[0];
    assert.deepEqual(Array.from(dominant.notes), ['G', 'B', 'D', 'F']);
});

test('sort compares chord numbers before quality at each position', () => {
    const input = ['VII-I', 'vi-I', 'VI-I', 'ii°-I', 'ii-I', 'II-I', 'i-I', 'I-I'];
    assert.deepEqual(input.sort(app.compareProgressions), ['I-I', 'i-I', 'II-I', 'ii-I', 'ii°-I', 'VI-I', 'vi-I', 'VII-I']);
    assert(app.compareProgressions('i-vi-IV', 'i-VII-IV') < 0);
    assert(app.compareProgressions('i-iv-V7-i', 'i-v-♭VII-IV') < 0);
    assert(app.compareProgressions('i-VI-II', 'i-VI-VII') < 0);
});

test('sort ignores accidentals and extensions, preserving ties', () => {
    assert.equal(app.compareProgressions('i-♭VII-IV', 'i-VII-IV'), 0);
    assert.equal(app.compareProgressions('I-V7-I', 'I-V-I'), 0);
    assert.equal(app.compareProgressions('I-♯IV-V', 'I-IV-V'), 0);
    assert(app.compareProgressions('i-VI-IV', 'i-♭VII-IV') < 0);
    assert(app.compareProgressions('i-VI', 'i-VI-VII') < 0);
});

test('progression selector data is sorted automatically', () => {
    for (let i = 1; i < app.PROGRESSIONS.length; i++) {
        assert(app.compareProgressions(app.PROGRESSIONS[i - 1], app.PROGRESSIONS[i]) <= 0);
    }
    assert(app.PROGRESSIONS.includes('i-v-♭VII-IV'));
});

test('all supported scales and tonics keep every enabled chord tone inside the scale', () => {
    let enabled = 0;
    for (const tonic of app.CHROMATIC_TONES) for (const scale of app.SCALE_TYPES) {
        const pitches = app.computeScaleNotes(tonic, scale).map(app.noteToSemitone);
        for (const progression of app.PROGRESSIONS) {
            const chords = app.getProgressionChords(tonic, scale, progression);
            if (!chords) continue;
            enabled++;
            assert.equal(chords.length, progression.split('-').length);
            for (const chord of chords) {
                assert(chord.notes.every(n => pitches.includes(app.noteToSemitone(n))), `${tonic} ${scale}: ${chord.name}`);
            }
        }
    }
    assert(enabled > 0, 'Must not disable every progression');
});
