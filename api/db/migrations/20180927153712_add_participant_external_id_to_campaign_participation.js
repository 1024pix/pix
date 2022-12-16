const TABLE_NAME = 'campaign-participations';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('participantExternalId');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('participantExternalId');
  });
};
