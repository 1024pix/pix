const TABLE_NAME = 'finalized-sessions';

export const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.integer('sessionId').primary();
    t.boolean('isPublishable').notNullable();
    t.text('certificationCenterName').notNullable();
    t.dateTime('finalizedAt').notNullable();
    t.date('date').notNullable();
    t.time('time').notNullable();
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
