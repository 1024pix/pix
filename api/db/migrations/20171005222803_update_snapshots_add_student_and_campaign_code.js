const up = function(knex) {
  return knex.schema.table('snapshots', (table) => {
    table.string('studentCode');
    table.string('campaignCode');
  });
};

const down = function(knex) {
  return knex.schema.table('snapshots', (table) => {
    table.dropColumn('studentCode');
    table.dropColumn('campaignCode');
  });
};

export { up, down };
