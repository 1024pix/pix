require('dotenv').config();
const { knex } = require('../../../db/knex-database-connection');
const { performance, PerformanceObserver } = require('perf_hooks');
const logger = require('../../../lib/infrastructure/logger');

const addConstraintsAndIndexesToAnswersKeBigintTemporaryTables = async () => {
  logger.debug('Start adding constraints and indexes to answers ke bigint tables');

  performance.mark('startTime');

  const obs = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      logger.debug(entry.name + ' took : ' + entry.duration + ' milliseconds');
    });
  });

  obs.observe({ entryTypes: ['measure'], buffered: true });

  await knex.transaction(async (trx) => {
    logger.debug('create indexes and constraints for answers_bigint table');

    await knex.raw('ALTER TABLE "answers_bigint" ALTER COLUMN "id" SET NOT NULL').transacting(trx);
    await knex.raw('ALTER TABLE "answers_bigint" ALTER COLUMN "challengeId" SET NOT NULL').transacting(trx);
    await knex.raw('ALTER TABLE "answers_bigint" ALTER COLUMN "createdAt" SET NOT NULL').transacting(trx);
    await knex.raw('ALTER TABLE "answers_bigint" ALTER COLUMN "updatedAt" SET NOT NULL').transacting(trx);
    await knex.raw('ALTER TABLE "answers_bigint" ALTER COLUMN "isFocusedOut" SET NOT NULL').transacting(trx);

    performance.mark('answersBigIntNotNullConstraintsTime');

    await knex
      .raw(
        `ALTER TABLE "answers_bigint"
           ADD CONSTRAINT "answers_bigint_pkey" PRIMARY KEY("id")`
      )
      .transacting(trx);

    performance.mark('answersBigintPkey');
    performance.measure('answers_bigint_pkey', 'answersBigIntNotNullConstraintsTime', 'answersBigintPkey');

    await knex
      .raw(
        `ALTER TABLE "answers_bigint"
           ADD CONSTRAINT "answers_bigint_assessmentid_foreign" FOREIGN KEY ("assessmentId")
           REFERENCES "assessments" (id)`
      )
      .transacting(trx);

    performance.mark('answersBigintAssessmentidForeign');
    performance.measure('answers_bigint_pkey', 'answersBigintPkey', 'answersBigintAssessmentidForeign');

    await knex
      .raw(`CREATE INDEX "answers_bigint_assessmentid_index" ON "answers_bigint" USING btree ("assessmentId")`)
      .transacting(trx);

    performance.mark('answersBigintAssessmentidIndex');
    performance.measure(
      'answers_bigint_assessmentid_index',
      'answersBigintAssessmentidForeign',
      'answersBigintAssessmentidIndex'
    );

    await knex.raw('ALTER TABLE "knowledge-elements_bigint" ALTER COLUMN "id" SET NOT NULL').transacting(trx);
    await knex.raw('ALTER TABLE "knowledge-elements_bigint" ALTER COLUMN "createdAt" SET NOT NULL').transacting(trx);
    await knex.raw('ALTER TABLE "knowledge-elements_bigint" ALTER COLUMN "earnedPix" SET NOT NULL').transacting(trx);

    performance.mark('keBigIntNotNullConstraintsTime');
    performance.measure(
      'keBigIntNotNullConstraints',
      'answersBigintAssessmentidIndex',
      'keBigIntNotNullConstraintsTime'
    );

    await knex
      .raw('ALTER TABLE "knowledge-elements_bigint" ADD CONSTRAINT "knowledge-elements_bigint_pkey" PRIMARY KEY("id")')
      .transacting(trx);

    performance.mark('keBigintPkey');
    performance.measure('knowledge-elements_bigint', 'keBigIntNotNullConstraintsTime', 'keBigintPkey');

    await knex
      .raw(
        `ALTER TABLE "knowledge-elements_bigint"
           ADD CONSTRAINT "knowledge_elements_bigint_answerid_foreign" FOREIGN KEY("answerId")
           REFERENCES "answers_bigint"(id)`
      )
      .transacting(trx);

    performance.mark('keBigintAnsweridForeign');
    performance.measure('knowledge_elements_bigint_answerid_foreign', 'keBigintPkey', 'keBigintAnsweridForeign');

    await knex
      .raw(
        `ALTER TABLE "knowledge-elements_bigint"
           ADD CONSTRAINT "knowledge_elements_bigint_assessmentid_foreign" FOREIGN KEY ("assessmentId")
           REFERENCES "assessments" (id)`
      )
      .transacting(trx);

    performance.mark('keBigintAssessmentidForeign');
    performance.measure(
      'knowledge_elements_bigint_assessmentid_foreign',
      'keBigintAnsweridForeign',
      'keBigintAssessmentidForeign'
    );

    await knex
      .raw(
        `ALTER TABLE "knowledge-elements_bigint"
           ADD CONSTRAINT "knowledge_elements_bigint_userid_foreign" FOREIGN KEY ("userId")
           REFERENCES "users" (id)`
      )
      .transacting(trx);

    performance.mark('keBigintUseridForeign');
    performance.measure(
      'knowledge_elements_bigint_userid_foreign',
      'keBigintAssessmentidForeign',
      'keBigintUseridForeign'
    );

    await knex
      .raw(
        'CREATE INDEX "knowledge_elements_bigint_userid_index" ON "knowledge-elements_bigint" USING btree ("userId")'
      )
      .transacting(trx);

    performance.mark('keBigintUseridIndex');
    performance.measure('knowledge_elements_bigint_userid_index', 'keBigintUseridForeign', 'keBigintUseridIndex');

    await knex
      .raw(
        'CREATE INDEX "knowledge_elements_bigint_assessmentid_index" on "knowledge-elements_bigint" ("assessmentId")'
      )
      .transacting(trx);

    performance.mark('keBigintAssessmentIdIndex');
    performance.measure(
      'knowledge_elements_bigint_assessmentid_index',
      'keBigintUseridIndex',
      'keBigintAssessmentIdIndex'
    );
  });

  performance.mark('endTime');
  performance.measure('Global time for adding constraints and indexes', 'startTime', 'endTime');

  logger.debug('Finish adding constraints and indexes to answers ke bigint tables');

  performance.clearMarks();
  obs.disconnect();
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  try {
    logger.info(`Start script ${__filename}... `);
    await addConstraintsAndIndexesToAnswersKeBigintTemporaryTables();
    logger.info('End script: copy done successfully.');
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

module.exports = { addConstraintsAndIndexesToAnswersKeBigintTemporaryTables };
