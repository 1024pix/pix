const TABLE_NAME = 'competence-evaluations';
const COMPETENCEID_COLUMN = 'competenceId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(COMPETENCEID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(COMPETENCEID_COLUMN);
  });
};
