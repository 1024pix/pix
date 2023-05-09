const TABLE_NAME = 'supervisor-accesses';

const up = function(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('sessionId').references('sessions.id').notNullable();
    t.integer('userId').references('users.id').notNullable();
    t.dateTime('authorizedAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
