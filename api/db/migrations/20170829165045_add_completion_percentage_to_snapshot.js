exports.up = function(knex) {
  return knex.schema.table('snapshots', function(table) {
    table.string('completionPercentage', 6);
  });
};

exports.down = function(knex) {
  return knex.schema.table('snapshots', (table) => {
    table.dropColumn('completionPercentage');
  });
};
