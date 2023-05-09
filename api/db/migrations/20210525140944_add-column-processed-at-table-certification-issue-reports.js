const up = function(knex) {
  return knex.schema.table('certification-issue-reports', (table) => {
    table.dateTime('resolvedAt');
    table.string('resolution');
  });
};

const down = function(knex) {
  return knex.schema.table('certification-issue-reports', (table) => {
    table.dropColumn('resolvedAt');
    table.dropColumn('resolution');
  });
};

export { up, down };
