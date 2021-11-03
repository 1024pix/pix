const TABLE_NAME = 'supervisor-accesses';

exports.up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('sessionId').references('sessions.id').notNullable();
    t.integer('userId').references('users.id').notNullable();
    t.dateTime('authorizedAt').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
