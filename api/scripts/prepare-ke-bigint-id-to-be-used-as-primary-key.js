require('dotenv').config();

const { knex } = require('../db/knex-database-connection');
const logger = require('../lib/infrastructure/logger');

const migrateExistingData = async () => {
  const chunkSize = parseInt(process.env.KNOWLEDGE_ELEMENTS_BIGINT_MIGRATION_CHUNK_SIZE);
  if (isNaN(chunkSize) || chunkSize <= 0) {
    logger.fatal(
      'Environment variable "KNOWLEDGE_ELEMENTS_BIGINT_MIGRATION_CHUNK_SIZE" must be set as a positive integer'
    );
    process.exit(1);
  }

  let rowsUpdatedCount = 0;
  const maxId = (await knex('knowledge-elements').max('id').first()).max;

  for (let startId = 0; startId < maxId; startId += chunkSize) {
    const result = await knex.raw(
      `
        UPDATE "knowledge-elements"
        SET "bigintId" = id
        WHERE ID BETWEEN ?? AND ??`,
      [startId, startId + chunkSize]
    );

    rowsUpdatedCount = result.rowCount;
    logger.info(`Updated rows : ${rowsUpdatedCount}`);
  }
};

const buildIndexConcurrently = async () => {
  logger.info('Building index concurrently..');
  await knex.raw(
    'CREATE UNIQUE INDEX CONCURRENTLY "knowledge-elements_bigintId_index" ON "knowledge-elements"("bigintId")'
  );
  logger.info('Done');
};

(async () => {
  await migrateExistingData();
  await buildIndexConcurrently();
})();
