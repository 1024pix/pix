const KNOWLEDGE_ELEMENTS_TABLE_NAME = 'knowledge-elements';

const up = function(knex) {
  return knex.schema.createTable(KNOWLEDGE_ELEMENTS_TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('source');
    table.string('status');
    table.integer('pixScore').unsigned();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.integer('answerId').unsigned().references('answers.id').index();
    table.integer('assessmentId').unsigned().references('assessments.id').index();
    table.string('skillId').index();
  });
};

const down = function(knex) {
  return knex.schema.dropTable(KNOWLEDGE_ELEMENTS_TABLE_NAME);
};

export { up, down };
