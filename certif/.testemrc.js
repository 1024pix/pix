'use strict';

const config = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  reporter: 'dot',
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process?.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--disable-accelerated-2d-canvas',
        '--mute-audio',
        '--remote-debugging-port=9222',
        '--window-size=1440,900',
      ].filter(Boolean),
    },
  },
};

if (typeof module !== 'undefined') {
  module.exports = process?.env.CI
    ? {
        ...config,
        reporter: 'xunit',
        report_file: './test-results/report.xml',
      }
    : config;
}
