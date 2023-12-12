const TABLE_NAME = 'complementary-certifications';
const COLUMN_NAME = 'hasExternalJury';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNullable().default(false);
  });

  await knex(TABLE_NAME).update({ hasExternalJury: true }).whereIn('key', ['EDU_1ER_DEGRE', 'EDU_2ND_DEGRE']);
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => table.dropColumn(COLUMN_NAME));
};

export { up, down };
