const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const appURL = pathToFileURL(path.join(__dirname, '../index.html')).href;

const choose = (page, id, name) => page.locator(id).getByRole('button', { name, exact: true }).click();

async function progression(page, scale = 'Major', name = 'I-V-vi-IV') {
    await page.getByRole('tab', { name: 'Progressions', exact: true }).click();
    await choose(page, '#progression-tonic-list', 'C');
    await choose(page, '#progression-type-list', scale);
    await choose(page, '#progression-list', name);
}

async function fitsViewport(page) {
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const elements = page.locator('.tab-content.active svg, .tab-content.active table, .tab-content.active .scale-block, .tab-btn');
    for (const element of await elements.all()) {
        if (!await element.isVisible()) continue;
        const box = await element.boundingBox();
        expect(box.x, 'element extends past left edge').toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width, 'element extends past right edge').toBeLessThanOrEqual(page.viewportSize().width + 1);
    }
}

test.beforeEach(async ({ page }) => {
    page.on('pageerror', error => { throw error; });
    await page.goto(appURL);
});

test('tabs switch panels with click and keyboard', async ({ page }) => {
    await expect(page.getByRole('tab')).toHaveText(['Keys', 'Scales', 'Chords', 'Progressions']);
    for (const name of ['Scales', 'Chords', 'Progressions', 'Keys']) {
        const tab = page.getByRole('tab', { name, exact: true });
        await tab.focus();
        await page.keyboard.press('Enter');
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByRole('tabpanel')).toHaveCount(1);
        await expect(page.getByRole('tabpanel', { name, exact: true })).toBeVisible();
    }
});

test('key selection and collapsed sections work with the keyboard', async ({ page }) => {
    await page.getByRole('button', { name: 'C major', exact: true }).focus();
    await page.keyboard.press('Enter');
    for (const name of ['Chord Borrowing', 'Chromatic Mediants']) {
        const heading = page.getByRole('button', { name: new RegExp(name) });
        await expect(heading).toHaveAttribute('aria-expanded', 'false');
        const section = heading.locator('..');
        await expect(section).toHaveClass(/collapsed/);
        await heading.focus();
        await page.keyboard.press('Enter');
        await expect(heading).toHaveAttribute('aria-expanded', 'true');
        await expect(section).not.toHaveClass(/collapsed/);
        await page.keyboard.press('Space');
        await expect(heading).toHaveAttribute('aria-expanded', 'false');
    }
    await page.locator('.chord-table tr[data-chord-idx="0"]').click();
    await expect(page.locator('#chord-info-panel')).toBeVisible();
    await page.locator('#clear-btn').click();
    await expect(page.locator('#info-default')).toBeVisible();
    await expect(page.locator('#chord-info-panel')).toBeHidden();
});

test('scales and chords render independently and enforce inversion limits', async ({ page }) => {
    await page.getByRole('tab', { name: 'Scales', exact: true }).click();
    await choose(page, '#scale-tonic-list', 'D');
    await choose(page, '#scale-type-list', 'Dorian');
    await expect(page.locator('#scale-result h2')).toHaveText('D Dorian');
    await expect(page.locator('#scale-result .piano-svg')).toBeVisible();
    await page.getByRole('tab', { name: 'Chords', exact: true }).click();
    await choose(page, '#chord-root-list', 'C');
    await choose(page, '#chord-type-list', '7th');
    await choose(page, '#chord-inversion-list', 'Third');
    await expect(page.locator('#chord-result h2')).toContainText('Third Inversion');
    await choose(page, '#chord-type-list', 'Major');
    await expect(page.locator('#chord-inversion-list').getByRole('button', { name: 'Third' })).toBeDisabled();
    await expect(page.locator('#chord-result h2')).toHaveText('C Major');
    await page.getByRole('tab', { name: 'Scales', exact: true }).click();
    await expect(page.locator('#scale-result h2')).toHaveText('D Dorian');
});

test('progressions filter chords and preserve independent inversion controls', async ({ page }) => {
    await progression(page);
    const result = page.locator('#progression-result');
    await expect(result.locator('.chord-name-cell')).toHaveText(['C', 'G', 'Am', 'F']);
    await expect(result.locator('.piano-svg')).toHaveCount(4);
    const groups = result.getByRole('group');
    const original = await result.locator('.piano-svg').first().innerHTML();
    await groups.nth(0).getByRole('button', { name: 'First inversion' }).click();
    await expect(groups.nth(0).getByRole('button', { name: 'First inversion' })).toBeFocused();
    await expect(groups.nth(0).getByRole('button', { name: 'First inversion' })).toHaveAttribute('aria-pressed', 'true');
    await expect(groups.nth(1).getByRole('button', { name: 'Root', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(await result.locator('.piano-svg').first().innerHTML()).not.toBe(original);
    await choose(page, '#progression-type-list', 'Natural minor');
    await expect(result).toBeHidden();
    await expect(page.locator('#progression-list').getByRole('button', { name: 'I-V-vi-IV', exact: true })).toBeDisabled();
    await choose(page, '#progression-type-list', 'Harmonic minor');
    await choose(page, '#progression-list', 'i-iv-V7-i');
    await expect(result.locator('.chord-name-cell')).toHaveText(['Cm', 'Fm', 'G7', 'Cm']);
    await expect(result.getByRole('button', { name: 'Third inversion' })).toHaveCount(1);
    await result.getByRole('button', { name: 'Third inversion' }).click();
    await expect(result.getByRole('button', { name: 'Third inversion' })).toHaveAttribute('aria-pressed', 'true');
    await choose(page, '#progression-tonic-list', 'C');
    await expect(result).toBeHidden();
});

test('populated tabs fit the viewport and progression keyboards stack vertically', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'C major', exact: true }).focus();
    await page.keyboard.press('Enter');
    await fitsViewport(page);
    await page.getByRole('tab', { name: 'Scales', exact: true }).click();
    await choose(page, '#scale-tonic-list', 'D♯');
    await choose(page, '#scale-type-list', 'Major');
    await fitsViewport(page);
    await page.getByRole('tab', { name: 'Chords', exact: true }).click();
    await choose(page, '#chord-root-list', 'C');
    await choose(page, '#chord-type-list', '7th');
    await fitsViewport(page);
    await progression(page);
    await fitsViewport(page);
    const sections = page.locator('#progression-result section');
    let bottom = 0;
    for (const section of await sections.all()) {
        const box = await section.boundingBox();
        expect(box.y).toBeGreaterThanOrEqual(bottom);
        bottom = box.y + box.height;
        const controls = await section.getByRole('group').boundingBox();
        const keyboard = await section.locator('svg').boundingBox();
        expect(keyboard.y).toBeGreaterThanOrEqual(controls.y + controls.height);
    }
    const selectors = await page.locator('#tab-progressions .scales-selector').boundingBox();
    const result = await page.locator('#progression-result').boundingBox();
    if (page.viewportSize().width <= 950) expect(result.y).toBeGreaterThanOrEqual(selectors.y + selectors.height);
    else expect(result.x).toBeGreaterThanOrEqual(selectors.x + selectors.width);
    await testInfo.attach('progressions-layout', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
