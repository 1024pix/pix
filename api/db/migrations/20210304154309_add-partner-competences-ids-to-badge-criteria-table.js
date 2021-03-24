const TABLE_NAME = 'badge-criteria';
const NEW_COLUMN = 'partnerCompetenceIds';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.specificType(NEW_COLUMN, 'int[]');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(NEW_COLUMN);
  });
};
