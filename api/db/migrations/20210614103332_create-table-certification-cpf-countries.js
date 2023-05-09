const TABLE_NAME = 'certification-cpf-countries';

const up = function(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('code').notNullable();
    t.string('commonName').notNullable();
    t.string('originalName').notNullable();
    t.string('matcher').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
