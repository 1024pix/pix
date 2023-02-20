const TABLE_NAME = 'reset-password-demands';

export const up = function (knex) {
  function table(t) {
    t.increments().primary();
    t.string('email').index();
    t.string('temporaryKey').index();
    t.boolean('used').default(0);
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema.createTable(TABLE_NAME, table);
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
