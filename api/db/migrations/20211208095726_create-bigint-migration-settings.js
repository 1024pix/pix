exports.up = async function(knex) {
  await knex.raw(`CREATE TABLE "bigint-migration-settings" (
                    "isScheduled" BOOLEAN NOT NULL,
                    "chunkSize" INTEGER NOT NULL CHECK ("chunkSize" > 0)
                    )`);
};

exports.down = async function(knex) {
  await knex.raw('DROP TABLE "bigint-migration-settings"');
};
