const TABLE_NAME = 'campaign-participations';
const CAMPAIGNID_COLUMN = 'campaignId';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(CAMPAIGNID_COLUMN);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(CAMPAIGNID_COLUMN);
  });
};

export { up, down };
