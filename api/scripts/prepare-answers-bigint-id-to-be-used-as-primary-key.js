require('dotenv').config();

const { knex } = require('../db/knex-database-connection');
const logger = require('../lib/infrastructure/logger');

const migrateExistingData = async () => {

  const chunkSize = parseInt(process.env.ANSWERS_ELEMENTS_BIGINT_MIGRATION_CHUNK_SIZE);
  if (isNaN(chunkSize) || chunkSize <= 0) {
    logger.fatal('Environment variable "ANSWERS_ELEMENTS_BIGINT_MIGRATION_CHUNK_SIZE" must be set as a positive integer');
    process.exit(1);
  }

  const maxId = (await knex('answers').max('id').first()).max;

  for (let id = 0; id < maxId; id += chunkSize) {
    const result = await knex.raw(`
        UPDATE "answers"
        SET "bigintId" = "id"
        WHERE "id" BETWEEN ?? AND ??`, [id, id + chunkSize - 1]);

    const rowsUpdatedCount = result.rowCount;
    logger.info(`Updated rows : ${rowsUpdatedCount}`);
  }

  for (let id = 0; id < maxId; id += chunkSize) {
    const result = await knex.raw(`
        UPDATE "knowledge-elements"
        SET "answer_bigintId" = "answerId"
        WHERE "id" BETWEEN ?? AND ??`, [id, id + chunkSize - 1]);

    const rowsUpdatedCount = result.rowCount;
    logger.info(`Updated rows : ${rowsUpdatedCount}`);
  }

};

const buildIndexConcurrently = async () => {
  logger.info('Building index concurrently..');
  await knex.raw('CREATE UNIQUE INDEX CONCURRENTLY "answers_bigintId_index" ON "answers"("bigintId")');
  logger.info('Done');
};

(async () => {
  process.on('unhandledRejection', (error) => {
    logger.fatal(error);
    process.exit(1);
  });
  await migrateExistingData();
  await buildIndexConcurrently();
  process.exit(0);
})();

