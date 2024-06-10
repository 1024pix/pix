const { defineConfig } = require('cypress');
const preprocessor = require('@badeball/cypress-cucumber-preprocessor');
const browserify = require('@badeball/cypress-cucumber-preprocessor/browserify');
const { configureVisualRegression } = require('cypress-visual-regression');

const SEQUENCE_RESTART_AT_NUMBER = 10000000;

async function setupNodeEvents(on, config) {
  config.env.AUTH_SECRET = process.env.AUTH_SECRET;

  configureVisualRegression(on);

  await preprocessor.addCucumberPreprocessorPlugin(on, config);
  on('file:preprocessor', browserify.default(config));

  on('task', {
    async 'db:fixture'(data) {
      const file = require(`./cypress/fixtures/${data}.json`);
      const { knex } = await import('../../api/db/knex-database-connection.js');

      for (const row of file) {
        await knex(data).insert(row);
      }

      return knex.raw('SELECT sequence_name FROM information_schema.sequences;').then((sequenceNameQueryResult) => {
        const sequenceNames = sequenceNameQueryResult.rows.map((row) => row.sequence_name);

        const sequenceUpdatePromises = sequenceNames.map((sequenceName) => {
          return knex.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${SEQUENCE_RESTART_AT_NUMBER};`);
        });
        return Promise.all(sequenceUpdatePromises);
      });
    },
    log(message) {
      console.log(message);

      return null;
    },
  });

  return config;
}

module.exports = defineConfig({
  env: {
    APP_URL: 'http://localhost:4200',
    API_URL: 'http://localhost:3000',
    ORGA_URL: 'http://localhost:4201',
    visualRegressionType: 'regression',
  },
  video: false,
  blockHosts: ['*stats.pix.fr*', '*analytics.pix.fr*'],
  trashAssetsBeforeRuns: true,
  projectId: '3cjm89',
  numTestsKeptInMemory: 0,
  viewportWidth: 1500,
  retries: {
    runMode: 2,
  },
  e2e: {
    screenshotsFolder: 'cypress/snapshots/actual',
    supportFile: 'cypress/support/index.js',
    specPattern: 'cypress/integration/**/*{.test.js,.feature}',
    setupNodeEvents,
  },
});
