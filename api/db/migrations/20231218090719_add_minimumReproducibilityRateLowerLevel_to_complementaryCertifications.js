const TABLE_NAME = 'complementary-certifications';
const COLUMN_NAME = 'minimumReproducibilityRateLowerLevel';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.decimal(COLUMN_NAME, 5, 2).default(null);
  });

  await knex(TABLE_NAME)
    .update({
      minimumReproducibilityRateLowerLevel: knex.ref('minimumReproducibilityRate'),
    })
    .where({ key: 'CLEA' });

  await knex(TABLE_NAME)
    .update({ [COLUMN_NAME]: 60 })
    .whereNull('minimumReproducibilityRateLowerLevel');
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
