const TABLE_NAME = 'certification-cpf-cities';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('name').notNullable();
    t.string('postalCode').notNullable();
    t.string('INSEECode').notNullable();
    t.boolean('isActualName').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
