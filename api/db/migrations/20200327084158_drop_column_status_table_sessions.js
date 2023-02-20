const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'status';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME).defaultTo('created');
  });
  await knex.raw('UPDATE "sessions" SET "status" = \'finalized\' WHERE "sessions"."finalizedAt" IS NOT NULL');
  return knex.raw('UPDATE "sessions" SET "status" = \'processed\' WHERE "sessions"."publishedAt" IS NOT NULL');
};
