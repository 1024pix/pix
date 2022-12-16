const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'showSkills';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });
  await knex(TABLE_NAME).whereIn('type', ['SUP', 'PRO']).update({ showSkills: true });
};
exports.down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
