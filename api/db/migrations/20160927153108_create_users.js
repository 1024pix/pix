const TABLE_NAME = 'users';

export const up = (knex) => {
  function table(t) {
    t.increments().primary();
    t.string('firstName').notNullable();
    t.string('lastName').notNullable();
    t.string('email').nullable();
    t.string('login').notNullable();
    t.string('password').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema.createTable(TABLE_NAME, table);
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
