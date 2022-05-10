require('dotenv').config();
const { performance } = require('perf_hooks');
const { knex } = require('../../../db/knex-database-connection');
const logger = require('../../../lib/infrastructure/logger');

const copyAnswerKeDataInsertedBeforeTrigger = async () => {
  const startTime = performance.now();

  await knex.transaction(async (trx) => {
    logger.debug('Start copy answer and Ke to bigint table inserted before trigger');

    await knex
      .raw(
        `WITH range AS (
            SELECT bms."startsAtId", bms."endsAtId" FROM "bigint-migration-settings" bms WHERE bms."tableName" = 'answers')
            INSERT INTO "answers_bigint" ("id", "value", "result", "assessmentId", "challengeId", timeout, "resultDetails", "timeSpent", "isFocusedOut")
            SELECT a_source."id"::BIGINT, a_source."value", a_source."result", a_source."assessmentId", a_source."challengeId", a_source."timeout", a_source."resultDetails", a_source."timeSpent", a_source."isFocusedOut" FROM "answers" a_source, range
            WHERE a_source.id BETWEEN range."startsAtId" AND range."endsAtId"`
      )
      .transacting(trx);

    await knex
      .raw(
        `WITH range AS (
            SELECT bms."startsAtId", bms."endsAtId" FROM "bigint-migration-settings" bms WHERE bms."tableName" = 'knowledge-elements')
            INSERT INTO "knowledge-elements_bigint" ("id", "source", "status", "createdAt", "answerId", "assessmentId", "skillId", "earnedPix", "userId", "competenceId")
            SELECT ke_source.id::BIGINT, ke_source.source, ke_source.status, ke_source."createdAt", ke_source."answerId", ke_source."assessmentId", ke_source."skillId", ke_source."earnedPix", ke_source."userId", ke_source."competenceId" FROM "knowledge-elements" ke_source, range
            WHERE ke_source.id BETWEEN range."startsAtId" AND range."endsAtId"`
      )
      .transacting(trx);

    logger.debug('End copy answer and Ke to bigint table inserted before trigger');
  });
  const endTime = performance.now();

  logger.debug(`Call to copyAnswerKeDataInsertedBeforeTrigger took ${endTime - startTime} milliseconds`);
  logger.debug('Finish copy answer and Ke to bigint table inserted before trigger');
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  try {
    logger.info(`Start script ${__filename}... `);
    await copyAnswerKeDataInsertedBeforeTrigger();
    logger.debug('End script: copy done successfully.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
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

module.exports = { copyAnswerKeDataInsertedBeforeTrigger };
