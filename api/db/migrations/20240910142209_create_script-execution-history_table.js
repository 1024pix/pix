const TABLE_NAME = 'script-executions';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.text('scriptName').notNullable();
    table.text('command').notNullable();
    table.text('error').defaultTo(null);
    table.dateTime('startedAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('endedAt').defaultTo(null);
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
