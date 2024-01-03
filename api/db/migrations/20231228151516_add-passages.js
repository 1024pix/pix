const TABLE_NAME = 'passages';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id');
    table.string('moduleId').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
