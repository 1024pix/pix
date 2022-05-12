require('dotenv').config();
const { performance } = require('perf_hooks');
const { knex } = require('../../../db/knex-database-connection');
const logger = require('../../../lib/infrastructure/logger');

const switchTmpBigintTablesToAnswerKeTables = async () => {
  const startTime = performance.now();

  await knex.transaction(async (trx) => {
    logger.debug('Start switch answer and Ke tmp bigint tables');

    await knex.raw(`LOCK TABLE "answers" IN ACCESS EXCLUSIVE MODE`).transacting(trx);
    await knex.raw(`LOCK TABLE "knowledge-elements" IN ACCESS EXCLUSIVE MODE;`).transacting(trx);

    await knex.raw('DROP TRIGGER IF EXISTS "trg_answers" on "answers"').transacting(trx);
    await knex.raw('DROP TRIGGER IF EXISTS "trg_knowledge-elements" on "knowledge-elements"').transacting(trx);
    await knex.raw('DROP FUNCTION IF EXISTS "insert_answers_in_answers_bigint"').transacting(trx);
    await knex.raw('DROP FUNCTION IF EXISTS "insert_knowledge-elements_in_knowledge-elements_bigint"').transacting(trx);

    await knex.raw('ALTER SEQUENCE "answers_id_seq" OWNED BY "answers_bigint"."id"').transacting(trx);
    await knex.raw('ALTER SEQUENCE "answers_id_seq" AS bigint').transacting(trx);
    await knex
      .raw('ALTER TABLE "answers_bigint" ALTER COLUMN "id" SET DEFAULT nextval(\'"answers_id_seq"\')')
      .transacting(trx);

    await knex
      .raw('ALTER SEQUENCE "knowledge-elements_id_seq" OWNED BY "knowledge-elements_bigint"."id"')
      .transacting(trx);
    await knex.raw('ALTER SEQUENCE "knowledge-elements_id_seq" AS bigint').transacting(trx);
    await knex
      .raw(
        'ALTER TABLE "knowledge-elements_bigint" ALTER COLUMN "id" SET DEFAULT nextval(\'"knowledge-elements_id_seq"\')'
      )
      .transacting(trx);

    await knex.raw('DROP TABLE "knowledge-elements"').transacting(trx);
    await knex.raw('ALTER TABLE "knowledge-elements_bigint" RENAME TO "knowledge-elements"').transacting(trx);

    await knex
      .raw('ALTER TABLE "flash-assessment-results" DROP CONSTRAINT "flash_assessment_results_answerid_foreign"')
      .transacting(trx);
    await knex.raw('DROP TABLE answers').transacting(trx);
    await knex.raw('ALTER TABLE "answers_bigint" RENAME TO "answers"').transacting(trx);
    await knex
      .raw('ALTER INDEX "answers_bigint_assessmentid_index" RENAME TO "answers_assessmentid_index"')
      .transacting(trx);

    await knex.raw('ALTER TABLE "answers" RENAME CONSTRAINT "answers_bigint_pkey" TO "answers_pkey"').transacting(trx);
    await knex
      .raw(
        'ALTER TABLE "answers" RENAME CONSTRAINT "answers_bigint_assessmentid_foreign" TO "answers_assessmentid_foreign"'
      )
      .transacting(trx);
    await knex
      .raw(
        'ALTER TABLE "knowledge-elements" RENAME CONSTRAINT "knowledge-elements_bigint_pkey" TO "knowledge-elements_pkey"'
      )
      .transacting(trx);
    await knex
      .raw(
        'ALTER TABLE "knowledge-elements" RENAME CONSTRAINT "knowledge_elements_bigint_assessmentid_foreign" TO "knowledge_elements_assessmentid_foreign"'
      )
      .transacting(trx);
    await knex
      .raw(
        'ALTER TABLE "knowledge-elements" RENAME CONSTRAINT "knowledge_elements_bigint_userid_foreign" TO "knowledge_elements_userid_foreign"'
      )
      .transacting(trx);
    await knex
      .raw(
        'ALTER TABLE "knowledge-elements" RENAME CONSTRAINT "knowledge_elements_bigint_answerid_foreign" TO "knowledge_elements_answerid_foreign"'
      )
      .transacting(trx);
    await knex
      .raw('ALTER INDEX "knowledge_elements_bigint_userid_index" RENAME TO "knowledge_elements_userid_index"')
      .transacting(trx);
    await knex
      .raw(
        'ALTER INDEX "knowledge_elements_bigint_assessmentid_index" RENAME TO "knowledge_elements_assessmentid_index"'
      )
      .transacting(trx);
    await knex
      .raw(
        `ALTER TABLE "flash-assessment-results"
           ADD CONSTRAINT "flash_assessment_results_answerid_foreign" FOREIGN KEY ("answerId") REFERENCES "answers" (id)`
      )
      .transacting(trx);
  });
  logger.debug('End switch answer and Ke tmp bigint');

  const endTime = performance.now();

  logger.debug(`Call to switchTmpBigintTablesToAnswerKeTables took ${endTime - startTime} milliseconds`);
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  try {
    logger.info(`Start script ${__filename}... `);
    await switchTmpBigintTablesToAnswerKeTables();
    logger.info('End script: switch table done successfully.');
  } catch (error) {
    logger.error(error);
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

module.exports = { switchTmpBigintTablesToAnswerKeTables };
