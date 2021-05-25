exports.up = function(knex) {
  return knex.schema.table('certification-issue-reports', (table) => {
    table.dateTime('resolvedAt');
    table.string('resolution');
  });
};

exports.down = function(knex) {
  return knex.schema.table('certification-issue-reports', (table) => {
    table.dropColumn('resolvedAt');
    table.dropColumn('resolution');
  });
};
