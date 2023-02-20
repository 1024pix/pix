export const up = function (knex) {
  return knex.schema.table('snapshots', function (table) {
    table.string('completionPercentage', 6);
  });
};

export const down = function (knex) {
  return knex.schema.table('snapshots', (table) => {
    table.dropColumn('completionPercentage');
  });
};
