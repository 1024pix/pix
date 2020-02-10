const TABLE_NAME = 'campaign-participations';
const CAMPAIGNID_COLUMN = 'campaignId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(CAMPAIGNID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(CAMPAIGNID_COLUMN);
  });
};
