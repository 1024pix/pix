const TABLE_NAME = 'memberships';
const COLUMN_NAME = 'updatedByUserId';

exports.up = async function(knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).unsigned().references('users.id');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
