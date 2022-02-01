const TABLE_NAME = 'badge-acquisitions';
const UPDATED_AT_COLUMN = 'updatedAt';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(UPDATED_AT_COLUMN).notNullable().defaultTo(knex.fn.now());
  });
  return knex(TABLE_NAME).update({
    updatedAt: knex.ref('createdAt'),
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(UPDATED_AT_COLUMN);
  });
};
