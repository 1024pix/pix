const config = {
  test_page: 'tests/index.html?hidepassed',
  reporter: 'dot',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  browser_args: {
    Chrome: [
      // --no-sandbox is needed when running Chrome inside a container
      process.env.CI ? '--no-sandbox' : null,
      '--headless',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
      '--mute-audio',
      '--remote-debugging-port=0',
      '--window-size=1440,900',
    ].filter(Boolean),
  },
  browser_disconnect_timeout: 20000,
  timeout: 20000,
};

module.exports = process.env.CI
  ? {
      ...config,
      reporter: 'xunit',
      report_file: `${process.env.RESULTS_PATH ?? '.'}/report.xml`,
    }
  : config;
