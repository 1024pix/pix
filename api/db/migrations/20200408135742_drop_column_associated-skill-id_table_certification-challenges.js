const TABLE_NAME = 'certification-challenges';
const COLUMN_NAME = 'associatedSkillId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
};
