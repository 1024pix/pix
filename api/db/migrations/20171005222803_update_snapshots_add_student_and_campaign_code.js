exports.up = (knex) => {
  return knex.schema.table('snapshots', (table) => {
    table.string('studentCode', 20);
    table.string('campaignCode', 20);
  });
};

exports.down = (knex) => {
  return knex.schema.table('snapshots', (table) => {
    table.dropColumn('studentCode');
    table.dropColumn('campaignCode');
  });
};
