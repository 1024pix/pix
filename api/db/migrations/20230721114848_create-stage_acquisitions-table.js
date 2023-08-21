export const STAGE_ACQUISITIONS_TABLE_NAME = 'stage-acquisitions';
export const USER_ID_COLUMN = 'userId';
export const STAGE_ID_COLUMN = 'stageId';
export const CAMPAIGN_PARTICIPATION_ID_COLUMN = 'campaignParticipationId';

const up = async function (knex) {
  await knex.schema.createTable(STAGE_ACQUISITIONS_TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.integer(USER_ID_COLUMN).references('users.id');
    table.integer(STAGE_ID_COLUMN).references('stages.id');
    table.integer(CAMPAIGN_PARTICIPATION_ID_COLUMN).references('campaign-participations.id').index();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = async function (knex) {
  await knex.schema.dropTable(STAGE_ACQUISITIONS_TABLE_NAME);
};

export { up, down };
