const TABLE_NAME = 'certification-scoring-configurations';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.jsonb('configuration').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.bigInteger('createdByUserId').index().references('users.id');
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
