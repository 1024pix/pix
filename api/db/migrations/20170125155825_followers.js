const TABLE_NAME = 'followers';

export const up = (knex) => {
  function table(t) {
    t.increments().primary();
    t.string('email').unique().notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema.createTable(TABLE_NAME, table);
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
