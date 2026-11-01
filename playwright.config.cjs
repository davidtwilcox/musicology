const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './browser-tests',
    fullyParallel: true,
    workers: 2,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        browserName: 'chromium',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure'
    },
    projects: [
        { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
        { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
        { name: 'mobile', use: { viewport: { width: 375, height: 812 } } }
    ]
});
