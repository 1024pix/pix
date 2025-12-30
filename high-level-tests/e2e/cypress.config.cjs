const { defineConfig } = require("cypress");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const {
  createEsbuildPlugin,
} = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const { configureVisualRegression } = require("cypress-visual-regression");
const cypressSplit = require("cypress-split");
const SEQUENCE_RESTART_AT_NUMBER = 10000000;

async function setupNodeEvents(cypressOn, config) {
  config.env.AUTH_SECRET = process.env.AUTH_SECRET;

  const on = require("cypress-on-fix")(cypressOn);

  cypressSplit(on, config);

  configureVisualRegression(on);

  await preprocessor.addCucumberPreprocessorPlugin(on, config);
  on(
    "file:preprocessor",
    createBundler({ plugins: [createEsbuildPlugin(config)] }),
  );

  on("task", {
    async "db:fixture"(data) {
      const file = require(`./cypress/fixtures/${data}.json`);
      const { knex } = await import("../../api/db/knex-database-connection.js");

      for (const row of file) {
        await knex(data).insert(row);
      }

      return knex
        .raw("SELECT sequence_name FROM information_schema.sequences;")
        .then((sequenceNameQueryResult) => {
          const sequenceNames = sequenceNameQueryResult.rows.map(
            (row) => row.sequence_name,
          );

          const sequenceUpdatePromises = sequenceNames.map((sequenceName) => {
            return knex.raw(
              `ALTER SEQUENCE "${sequenceName}" RESTART WITH ${SEQUENCE_RESTART_AT_NUMBER};`,
            );
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
    APP_URL: "http://localhost:4200",
    ORGA_URL: "http://localhost:4201",
    visualRegressionType: "regression",
  },
  video: false,
  blockHosts: ["*stats.pix.fr*", "*analytics.pix.fr*"],
  trashAssetsBeforeRuns: true,
  numTestsKeptInMemory: 0,
  viewportWidth: 1500,
  retries: {
    runMode: 2,
  },
  e2e: {
    screenshotsFolder: "cypress/snapshots/actual",
    supportFile: "cypress/support/index.js",
    specPattern: "cypress/integration/**/*{.test.js,.feature}",
    setupNodeEvents,
  },
});
