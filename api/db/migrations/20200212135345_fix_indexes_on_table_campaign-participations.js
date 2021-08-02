const TABLE_NAME = 'campaign-participations';
const CAMPAIGN_ID_COLUMN = 'campaignId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(CAMPAIGN_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(CAMPAIGN_ID_COLUMN);
  });
};
