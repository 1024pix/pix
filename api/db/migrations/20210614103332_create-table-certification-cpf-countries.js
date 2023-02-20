const TABLE_NAME = 'certification-cpf-countries';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('code').notNullable();
    t.string('commonName').notNullable();
    t.string('originalName').notNullable();
    t.string('matcher').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
