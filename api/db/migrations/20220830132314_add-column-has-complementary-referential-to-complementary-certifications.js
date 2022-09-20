const TABLE_NAME = 'complementary-certifications';
const COLUMN_NAME = 'hasComplementaryReferential';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME);
  });

  await knex(TABLE_NAME).update(COLUMN_NAME, true).where({ key: 'DROIT' });
  await knex(TABLE_NAME).update(COLUMN_NAME, true).where({ key: 'EDU_1ER_DEGRE' });
  await knex(TABLE_NAME).update(COLUMN_NAME, true).where({ key: 'EDU_2ND_DEGRE' });
  await knex(TABLE_NAME).update(COLUMN_NAME, false).where({ key: 'CLEA' });

  await knex.schema.alterTable(TABLE_NAME, async (table) => {
    await table.boolean(COLUMN_NAME).notNullable().alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
