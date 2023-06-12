const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'version';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).defaultTo(2).notNullable();
  });

  await knex(TABLE_NAME).update(COLUMN_NAME, 1).where('isV2Certification', false);
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
