const test = require('node:test');
const assert = require('node:assert/strict');
const loadApp = require('./helpers/load-app.cjs');
const app = loadApp();
const plain = value => JSON.parse(JSON.stringify(value));

for (const [tonic, type, expected] of [
    ['C', 'Major', ['C', 'D', 'E', 'F', 'G', 'A', 'B']],
    ['A', 'Natural minor', ['A', 'B', 'C', 'D', 'E', 'F', 'G']],
    ['A', 'Harmonic minor', ['A', 'B', 'C', 'D', 'E', 'F', 'G♯']],
    ['A', 'Melodic minor', ['A', 'B', 'C', 'D', 'E', 'F♯', 'G♯']],
    ['D', 'Dorian', ['D', 'E', 'F', 'G', 'A', 'B', 'C']],
    ['D♯', 'Major', ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D']],
    ['C', 'Major pentatonic', ['C', 'D', 'E', 'G', 'A']],
    ['C', 'Minor pentatonic', ['C', 'E♭', 'F', 'G', 'B♭']],
    ['C', 'Whole tone', ['C', 'D', 'E', 'F♯', 'G♯', 'A♯']]
]) {
    test(`${tonic} ${type} has correctly spelled notes`, () => {
        assert.deepEqual(plain(app.computeScaleNotes(tonic, type)), expected);
    });
}

test('pitch conversion handles accidentals and octave wrapping', () => {
    for (const [note, pitch] of [['C', 0], ['B♯', 0], ['C♭', 11], ['F♯♯', 7], ['B♭♭', 9]]) {
        assert.equal(app.noteToSemitone(note), pitch, note);
    }
});

test('relative major and minor keys have the expected diatonic chords', () => {
    assert.deepEqual(plain(app.getChords('major', 0).map(c => c.num)), ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    assert.deepEqual(plain(app.getChords('minor', 0).map(c => c.num)), ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
    assert.deepEqual(plain(app.getChordTones('major', 0, 6).map(t => t.note)), ['B', 'D', 'F']);
    assert.deepEqual(plain(app.getChordTones('minor', 0, 0).map(t => t.note)), ['A', 'C', 'E']);
});

test('every circle key has correctly spaced major, minor, or diminished triads', () => {
    const intervals = { Major: [0, 4, 7], Minor: [0, 3, 7], Diminished: [0, 3, 6] };
    for (const ring of ['major', 'minor']) for (let pos = 0; pos < 12; pos++) {
        app.getChords(ring, pos).forEach((chord, index) => {
            const pitches = app.getChordTones(ring, pos, index).map(t => app.noteToSemitone(t.note));
            assert.deepEqual(plain(pitches.map(p => (p - pitches[0] + 12) % 12)), intervals[chord.quality], `${ring} ${pos} ${chord.num}`);
        });
    }
});

test('C major chromatic mediants exclude its diatonic mediants', () => {
    const result = app.getChromaticMediants('C', 'major');
    assert.deepEqual(plain(result.upper.map(c => c.name)), ['E', 'E♭', 'E♭m']);
    assert.deepEqual(plain(result.lower.map(c => c.name)), ['A', 'A♭', 'A♭m']);
});
