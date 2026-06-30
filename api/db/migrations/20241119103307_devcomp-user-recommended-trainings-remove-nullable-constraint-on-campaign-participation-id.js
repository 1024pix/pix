const COLUMN_NAME = 'campaignParticipationId';

const up = async (knex) => {
  await knex.schema.alterTable('user-recommended-trainings', (table) => {
    table.integer(COLUMN_NAME).nullable().alter();
  });
};

const down = async (knex) => {
  await knex.schema.table('user-recommended-trainings', (table) => {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

export { down, up };
