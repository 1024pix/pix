const TABLE_NAME = 'badge-acquisitions';
const CAMPAIGN_PARTICIPATION_ID_COLUMN = 'campaignParticipationId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer(CAMPAIGN_PARTICIPATION_ID_COLUMN).references('campaign-participations.id').index();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(CAMPAIGN_PARTICIPATION_ID_COLUMN);
  });
};
