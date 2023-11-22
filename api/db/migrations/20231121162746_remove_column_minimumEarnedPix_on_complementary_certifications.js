const TABLE_NAME = 'complementary-certifications';
const COLUMN_NAME = 'minimumEarnedPix';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).nullable();
  });

  await knex('complementary-certifications')
    .update({
      minimumEarnedPix: 70,
    })
    .where({ label: 'CléA Numérique' });
};

export { up, down };
