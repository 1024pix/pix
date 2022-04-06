require('dotenv').config();
const { performance } = require('perf_hooks');
const { knex } = require('../../../db/knex-database-connection');
const logger = require('../../../lib/infrastructure/logger');

const copyAnswerKeDataToTemporaryTables = async () => {
  logger.debug('Start copy answers and knowledge-elements data');
  const startTime = performance.now();

  await knex.transaction(async (trx) => {
    await knex
      .raw(
        `INSERT INTO "answers_bigint"
    (id, value, result, "assessmentId", "challengeId", timeout, "resultDetails", "timeSpent", "isFocusedOut")
    SELECT
    a.id, a.value, a.result, a."assessmentId", a."challengeId", a.timeout, a."resultDetails", a."timeSpent", a."isFocusedOut"
    FROM "answers" a`
      )
      .transacting(trx);

    await knex
      .raw(
        `INSERT INTO "knowledge-elements_bigint"
    ( id, source, status, "createdAt", "answerId", "assessmentId", "skillId", "earnedPix", "userId", "competenceId")
    SELECT
    ke.id, ke.source, ke.status, ke."createdAt", ke."answerId", ke."assessmentId", ke."skillId", ke."earnedPix", ke."userId", ke."competenceId"
    FROM "knowledge-elements" ke`
      )
      .transacting(trx);
  });
  const endTime = performance.now();

  logger.debug(`Call to copyAnswerKeDataToTemporaryTables took ${endTime - startTime} milliseconds`);
  logger.debug('Finish copy');
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  try {
    logger.info(`Start script ${__filename}... `);
    await copyAnswerKeDataToTemporaryTables();
    logger.debug('End script: copy done successfully.');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

if (isLaunchedFromCommandLine) {
  main().then(
    () => process.exit(0),
    (err) => {
      logger.error(err);
      process.exit(1);
    }
  );
}

module.exports = { copyAnswerKeDataToTemporaryTables };
