const MAX_ROW_COUNT_FOR_SYNCHRONOUS_MIGRATION = 10000000;

export const up = async function (knex) {
  const nbRows = (await knex('knowledge-elements').max('id').first()).max;

  if (nbRows < MAX_ROW_COUNT_FOR_SYNCHRONOUS_MIGRATION) {
    await knex.raw('UPDATE "knowledge-elements" SET "bigintId" = id');
    await knex.raw('CREATE UNIQUE INDEX "knowledge-elements_bigintId_index" ON "knowledge-elements"("bigintId")');
  }
};

export const down = async function (knex) {
  await knex.raw('DROP INDEX IF EXISTS "knowledge-elements_bigintId_index"');
};
