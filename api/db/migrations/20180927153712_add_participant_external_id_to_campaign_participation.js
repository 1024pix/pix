const TABLE_NAME = 'campaign-participations';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('participantExternalId');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('participantExternalId');
  });
};

export { up, down };
