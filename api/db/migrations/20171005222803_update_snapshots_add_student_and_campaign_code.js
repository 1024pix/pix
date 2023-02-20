export const up = (knex) => {
  return knex.schema.table('snapshots', (table) => {
    table.string('studentCode');
    table.string('campaignCode');
  });
};

export const down = (knex) => {
  return knex.schema.table('snapshots', (table) => {
    table.dropColumn('studentCode');
    table.dropColumn('campaignCode');
  });
};
