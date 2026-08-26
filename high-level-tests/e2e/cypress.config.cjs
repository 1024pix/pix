const { defineConfig } = require("cypress");
const jsonwebtoken = require("jsonwebtoken");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const browserify = require("@cypress/browserify-preprocessor");
const {
  preprendTransformerToOptions,
} = require("@badeball/cypress-cucumber-preprocessor/browserify");
const cypressSplit = require("cypress-split");

const SEQUENCE_RESTART_AT_NUMBER = 10000000;

async function setupNodeEvents(cypressOn, config) {
  config.env.AUTH_SECRET = process.env.AUTH_SECRET;

  const on = require("cypress-on-fix")(cypressOn);

  cypressSplit(on, config);

  await preprocessor.addCucumberPreprocessorPlugin(on, config);
  on(
    "file:preprocessor",
    browserify(preprendTransformerToOptions(config, browserify.defaultOptions)),
  );

  on("task", {
    // jsonwebtoken >= 9 relies on crypto.createSecretKey, which the browserify
    // shim does not provide: tokens must be signed here, in the Node process.
    "jwt:sign"({ payload, options }) {
      const secret = process.env.AUTH_SECRET;
      if (!secret) {
        throw new Error(
          `AUTH_SECRET is missing: set it in the environment running Cypress, or in ${API_ENV_FILE}, with the same value as the API.`,
        );
      }

      return jsonwebtoken.sign(payload, secret, options);
    },
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
    supportFile: "cypress/support/index.js",
    specPattern: "cypress/integration/**/*{.test.js,.feature}",
    setupNodeEvents,
  },
});
