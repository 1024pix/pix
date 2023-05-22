const cucumber = require("cypress-cucumber-preprocessor").default;
const getCompareSnapshotsPlugin = require("cypress-visual-regression/dist/plugin");

const SEQUENCE_RESTART_AT_NUMBER = 10000000;

module.exports = (on, config) => {
  config.env.AUTH_SECRET = process.env.AUTH_SECRET;

  getCompareSnapshotsPlugin(on);
  on("file:preprocessor", cucumber());
  on("task", {
    async "db:fixture"(data) {
      const file = require("../fixtures/" + data + ".json");
      const { knex } = await import("../../../../api/db/knex-database-connection.js");

      for (const row of file) {
        await knex(data).insert(row);
      }

      return knex.raw("SELECT sequence_name FROM information_schema.sequences;")
        .then((sequenceNameQueryResult) => {
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
    }
  });
  return config;
};

