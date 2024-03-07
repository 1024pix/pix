const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'version';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME);
  });

  await knex(TABLE_NAME).update(COLUMN_NAME, 1).where('isV2Certification', false);
  await knex(TABLE_NAME).update(COLUMN_NAME, 2).where('isV2Certification', true);

  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
