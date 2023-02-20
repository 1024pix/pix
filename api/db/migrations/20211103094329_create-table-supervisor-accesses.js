const TABLE_NAME = 'supervisor-accesses';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('sessionId').references('sessions.id').notNullable();
    t.integer('userId').references('users.id').notNullable();
    t.dateTime('authorizedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
