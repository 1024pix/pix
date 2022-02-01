exports.up = (knex) => {
  return knex.schema.table('snapshots', (table) => {
    table.string('studentCode');
    table.string('campaignCode');
  });
};

exports.down = (knex) => {
  return knex.schema.table('snapshots', (table) => {
    table.dropColumn('studentCode');
    table.dropColumn('campaignCode');
  });
};
