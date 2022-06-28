require('dotenv').config();
const logger = require('../../../lib/infrastructure/logger');
const { knex } = require('../../../db/knex-database-connection');

async function alterTableAnswerColumnIdTypeFromIntToBigint(knex) {
  await knex.transaction(async (trx) => {
    logger.info('Altering knowledge-elements.answerId type to BIGINT - In progress');
    await knex.raw(`ALTER TABLE "knowledge-elements" ALTER COLUMN "answerId" TYPE BIGINT`).transacting(trx);
    logger.info('Altering knowledge-elements.answerId type to BIGINT - Done');

    logger.info('Altering flash-assessment-results.answerId type to BIGINT - In progress');
    await knex.raw(`ALTER TABLE "flash-assessment-results" ALTER COLUMN "answerId" TYPE BIGINT`).transacting(trx);
    logger.info('Altering flash-assessment-results.answerId type to BIGINT - Done');

    logger.info('Altering answers.id type to BIGINT - In progress');
    await knex.raw(`ALTER TABLE "answers" ALTER COLUMN "id" TYPE BIGINT`).transacting(trx);
    logger.info('Altering answers.id type to BIGINT - Done');

    logger.info('Altering answers_id_seq type to BIGINT - In progress');
    await knex.raw(`ALTER SEQUENCE "answers_id_seq" AS BIGINT`).transacting(trx);
    logger.info('Altering answers_id_seq type to BIGINT - Done');
  });
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  logger.info(`Start script ${__filename}... `);
  await alterTableAnswerColumnIdTypeFromIntToBigint(knex);
  logger.info('End script');
}

if (isLaunchedFromCommandLine) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = { alterTableAnswerColumnIdTypeFromIntToBigint };
