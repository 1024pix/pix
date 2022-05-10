require('dotenv').config();
const { knex } = require('../../../db/knex-database-connection');
const { performance } = require('perf_hooks');
const logger = require('../../../lib/infrastructure/logger');

const copyNewlyInsertedRowsToAnswerIdTmpBigintTables = async () => {
  const startTime = performance.now();

  await knex.transaction(async (trx) => {
    logger.debug('init bigint migration setting');

    await knex.raw(`LOCK TABLE "answers" IN ACCESS EXCLUSIVE MODE`).transacting(trx);
    await knex.raw(`LOCK TABLE "knowledge-elements" IN ACCESS EXCLUSIVE MODE;`).transacting(trx);
    await knex
      .raw(
        `INSERT INTO "bigint-migration-settings"("tableName", "startsAtId", "endsAtId")
               VALUES ('answers', (SELECT MAX(id) + 1 FROM "answers_bigint"), (SELECT MAX(id)
               FROM "answers") )`
      )
      .transacting(trx);
    await knex
      .raw(
        `INSERT INTO "bigint-migration-settings"("tableName", "startsAtId", "endsAtId")
               VALUES ('knowledge-elements', (SELECT MAX(id) + 1 FROM "knowledge-elements_bigint"), (SELECT MAX(id)
               FROM "knowledge-elements"))`
      )
      .transacting(trx);

    logger.debug('Finish init bigint migration setting');

    logger.debug('create triggers for answers_bigint and ke_bigint table');

    await knex
      .raw(
        `CREATE OR REPLACE FUNCTION "insert_answers_in_answers_bigint"()
                    RETURNS TRIGGER AS
                    $$
                    BEGIN
                      INSERT INTO "answers_bigint" ("id", "value", "result", "assessmentId", "challengeId", timeout, "resultDetails", "timeSpent", "isFocusedOut")
                      VALUES         (NEW."id"::BIGINT, NEW."value", NEW."result", NEW."assessmentId", NEW."challengeId", NEW."timeout", NEW."resultDetails", NEW."timeSpent", NEW."isFocusedOut");
                     RETURN NEW;
                    END
                    $$ LANGUAGE plpgsql;`
      )
      .transacting(trx);

    await knex
      .raw(
        `CREATE TRIGGER "trg_answers"
                    AFTER INSERT ON "answers"
                    FOR EACH ROW
                    EXECUTE FUNCTION "insert_answers_in_answers_bigint"();`
      )
      .transacting(trx);

    await knex
      .raw(
        `CREATE OR REPLACE FUNCTION "insert_knowledge-elements_in_knowledge-elements_bigint"()
                    RETURNS TRIGGER AS
                    $$
                    BEGIN
                       INSERT INTO "knowledge-elements_bigint"( id, source, status, "createdAt", "answerId", "assessmentId", "skillId", "earnedPix", "userId", "competenceId")
                       VALUES ( NEW.id::BIGINT, NEW.source, NEW.status, NEW."createdAt", NEW."answerId", NEW."assessmentId", NEW."skillId", NEW."earnedPix", NEW."userId", NEW."competenceId");
                      RETURN NEW;
                    END
                    $$ LANGUAGE plpgsql;`
      )
      .transacting(trx);

    await knex
      .raw(
        `CREATE TRIGGER "trg_knowledge-elements"
                    AFTER INSERT ON "knowledge-elements"
                    FOR EACH ROW
                    EXECUTE FUNCTION "insert_knowledge-elements_in_knowledge-elements_bigint"();`
      )
      .transacting(trx);
  });
  const endTime = performance.now();

  logger.debug(`Call to copyNewlyInsertedRowsToAnswerIdTmpBigintTables took ${endTime - startTime} milliseconds`);
  logger.debug('Finish adding triggers');
};

async function main() {
  logger.info(`Start script ${__filename}... `);
  await copyNewlyInsertedRowsToAnswerIdTmpBigintTables();
  logger.info('End script: done successfully.');
}

const isLaunchedByCommandLine = require.main === module;
if (isLaunchedByCommandLine) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = { copyNewlyInsertedRowsToAnswerIdTmpBigintTables };
