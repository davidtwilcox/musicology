const test = require('node:test');
const assert = require('node:assert/strict');
const loadApp = require('./helpers/load-app.cjs');

function headerFixture(collapsed) {
    const classes = new Set(collapsed ? ['collapsed'] : []);
    const attributes = {}, handlers = {};
    return {
        attributes, handlers,
        parentElement: { classList: {
            contains(name) { return classes.has(name); },
            toggle(name) {
                if (classes.has(name)) { classes.delete(name); return false; }
                classes.add(name);
                return true;
            }
        } },
        setAttribute(name, value) { attributes[name] = value; },
        addEventListener(name, handler) { handlers[name] = handler; }
    };
}

test('collapsible headers expose their initial state and toggle by click and keyboard', () => {
    const app = loadApp();
    for (const collapsed of [true, false]) {
        const header = headerFixture(collapsed);
        app.makeCollapsible([header]);
        assert.equal(header.attributes.role, 'button');
        assert.equal(header.attributes.tabindex, '0');
        assert.equal(header.attributes['aria-expanded'], String(!collapsed));
        header.handlers.click();
        assert.equal(header.attributes['aria-expanded'], String(collapsed));
        for (const key of ['Enter', ' ']) {
            let prevented = false;
            const before = header.attributes['aria-expanded'];
            header.handlers.keydown({ key, preventDefault() { prevented = true; } });
            assert(prevented);
            assert.notEqual(header.attributes['aria-expanded'], before);
        }
        const before = header.attributes['aria-expanded'];
        header.handlers.keydown({ key: 'ArrowDown' });
        assert.equal(header.attributes['aria-expanded'], before);
    }
});

test('chord renderer rotates note order and interval labels for inversions', () => {
    const app = loadApp();
    for (const [inversion, expected] of [
        ['Root', ['C', 'E', 'G', 'B♭']],
        ['First', ['E', 'G', 'B♭', 'C']],
        ['Second', ['G', 'B♭', 'C', 'E']],
        ['Third', ['B♭', 'C', 'E', 'G']]
    ]) {
        app.setInversion(inversion);
        const html = app.renderChordResult('C', '7th');
        const notes = [...html.matchAll(/<td class="note-cell">([^<]+)<\/td>/g)].map(m => m[1]);
        assert.deepEqual(notes, expected);
        const labels = [...html.matchAll(/<td class="interval-cell">([^<]+)<\/td>/g)].map(m => m[1]);
        const intervals = { C: 'Root', E: 'Major Third', G: 'Perfect Fifth', 'B♭': 'Minor Seventh' };
        assert.deepEqual(labels, expected.map(note => intervals[note]));
    }
});

test('piano places an inverted bass below the raised root', () => {
    const app = loadApp();
    function highlightedKeys(notes) {
        return [...app.renderPianoSvg(notes).matchAll(/<path d="M([\d.]+) [^"]*" fill="#(?:818cf8|6366f1)"/g)]
            .map(match => Number(match[1])).sort((a, b) => a - b);
    }
    assert.deepEqual(highlightedKeys(['C', 'E', 'G']), [15, 63, 111]);
    assert.deepEqual(highlightedKeys(['E', 'G', 'C']), [63, 111, 183]);
    assert.deepEqual(highlightedKeys(['G', 'C', 'E']), [111, 183, 231]);
});

test('all progression chord inversions fit on the rendered keyboard', () => {
    const app = loadApp();
    for (const tonic of app.CHROMATIC_TONES) for (const scale of app.SCALE_TYPES) {
        for (const progression of app.PROGRESSIONS) {
            const chords = app.getProgressionChords(tonic, scale, progression);
            if (!chords) continue;
            for (const chord of chords) for (let inversion = 0; inversion < chord.notes.length; inversion++) {
                const notes = chord.notes.slice(inversion).concat(chord.notes.slice(0, inversion));
                const svg = app.renderPianoSvg(notes);
                assert.equal((svg.match(/fill="#(?:818cf8|6366f1)"/g) || []).length, notes.length,
                    `${tonic} ${scale}: ${chord.name} inversion ${inversion}`);
            }
        }
    }
});

test('generated HTML escapes markup in text', () => {
    assert.equal(loadApp().esc('<script>&'), '&lt;script&gt;&amp;');
});
