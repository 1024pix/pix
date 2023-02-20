const TABLE_NAME = 'campaign-participations';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('participantExternalId');
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('participantExternalId');
  });
};
