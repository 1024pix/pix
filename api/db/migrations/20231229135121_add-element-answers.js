const TABLE_NAME = 'element-answers';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.bigIncrements('id');
    table.integer('passageId').notNullable().references('id').inTable('passages');
    table.string('elementId').notNullable();
    table.string('grainId').notNullable();
    table.string('value').notNullable();
    table.string('status').notNullable();
  });
};

const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
