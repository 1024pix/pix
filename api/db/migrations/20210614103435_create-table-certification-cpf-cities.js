const TABLE_NAME = 'certification-cpf-cities';

const up = function(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('name').notNullable();
    t.string('postalCode').notNullable();
    t.string('INSEECode').notNullable();
    t.boolean('isActualName').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
