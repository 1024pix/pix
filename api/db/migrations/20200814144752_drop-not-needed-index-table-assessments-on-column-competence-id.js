const TABLE_NAME = 'assessments';
const COMPETENCEID_COLUMN = 'competenceId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropIndex(COMPETENCEID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.index(COMPETENCEID_COLUMN);
  });
};
