const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual inline script in isolation. Inject exports before UI startup
// so production code stays self-contained and does not expose testing globals.
module.exports = function loadApp() {
    const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1, 'Expected one inline application script');
    const source = scripts[0][1];
    const startup = '        buildCircle();';
    assert.equal(source.split(startup).length, 2, 'Expected a unique UI startup boundary');
    const document = {
        getElementById() { return {}; },
        createTextNode(text) { return String(text); },
        createElement() {
            return {
                innerHTML: '',
                appendChild(text) {
                    this.innerHTML += text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
            };
        }
    };
    const context = vm.createContext({ document });
    const exports = `globalThis.app = {
        computeScaleNotes, computeScale, noteToSemitone, getScale, getChords,
        getChordTones, getChromaticMediants, compareProgressions, getProgressionChords,
        renderPianoSvg, renderChordResult, makeCollapsible, esc,
        CHROMATIC_TONES, SCALE_TYPES, PROGRESSIONS,
        setInversion(value) { selectedInversion = value; }
    }; return;`;
    vm.runInContext(source.replace(startup, exports + startup), context, { timeout: 1000 });
    return context.app;
};
