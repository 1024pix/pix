const TABLE_NAME = 'competence-evaluations';
const COMPETENCE_ID_COLUMN = 'competenceId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(COMPETENCE_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(COMPETENCE_ID_COLUMN);
  });
};
