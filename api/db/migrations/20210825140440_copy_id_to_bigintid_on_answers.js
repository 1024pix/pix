const MAX_ROW_COUNT_FOR_SYNCHRONOUS_MIGRATION = 10000000;
const FAKE_VALUE_TO_COMPLY_WITH_NOT_NULL_CONSTRAINT_MANDATORY_FOR_FUTURE_PK = -1;

exports.up = async function(knex) {
  const nbRows = (await knex('answers').max('id').first()).max;

  if (nbRows < MAX_ROW_COUNT_FOR_SYNCHRONOUS_MIGRATION) {

    await knex.raw('UPDATE "answers" SET "bigintId" = id');
    await knex.raw('CREATE UNIQUE INDEX "answers_bigintId_index" ON "answers"("bigintId")');

    await knex.raw('UPDATE "knowledge-elements" SET "answer_bigintId" = "answerId"');
  }
};

exports.down = async function(knex) {
  await knex.raw('DROP INDEX IF EXISTS "answers_bigintId_index"');
  await knex.raw(`UPDATE "answers" SET "bigintId" = ${FAKE_VALUE_TO_COMPLY_WITH_NOT_NULL_CONSTRAINT_MANDATORY_FOR_FUTURE_PK}`);

  await knex.raw('DROP INDEX IF EXISTS "elements_answer_bigintId_index"');
};
