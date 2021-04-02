const TABLE_NAME = 'competence-marks';
const COLUMN_NON_BLOCKED_LEVEL = 'nonBlockedLevel';
const COLUMN_NON_BLOCKED_SCORE = 'nonBlockedScore';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer(COLUMN_NON_BLOCKED_LEVEL).unsigned();
    table.integer(COLUMN_NON_BLOCKED_SCORE).unsigned();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NON_BLOCKED_LEVEL);
    table.dropColumn(COLUMN_NON_BLOCKED_SCORE);
  });
};
