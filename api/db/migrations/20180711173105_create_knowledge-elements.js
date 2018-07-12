/* eslint-disable no-console */
const KNOWLEDGE_ELEMENTS_TABLE_NAME = 'knowledge-elements';

exports.up = (knex) => {

  return knex.schema
    .createTable(KNOWLEDGE_ELEMENTS_TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.string('source');
      table.string('status');
      table.integer('pixScore').unsigned();

      table.bigInteger('answerId').references('answers.id').index();
      table.bigInteger('assessmentId').references('assessments.id').index();
      table.string('skillId').index('skillId');
    })
    .then(() => {
      console.log(`${KNOWLEDGE_ELEMENTS_TABLE_NAME} table is created!`);
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTable(KNOWLEDGE_ELEMENTS_TABLE_NAME)
    .then(() => {
      console.log(`${KNOWLEDGE_ELEMENTS_TABLE_NAME} table was dropped!`);
    });
};
