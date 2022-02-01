const TABLE_NAME = 'finalized-sessions';

exports.up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.integer('sessionId').primary();
    t.boolean('isPublishable').notNullable();
    t.text('certificationCenterName').notNullable();
    t.dateTime('finalizedAt').notNullable();
    t.date('date').notNullable();
    t.time('time').notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
