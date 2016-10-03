'use strict';

const TABLE_NAME = 'answers';

function table(t) {

  t.increments().primary();
  t.integer('assessment_id').unsigned().references('assessments.id');
  t.string('challenge_ref').notNull();
  t.string('value').notNull();
  t.timestamps();
}

exports.up = (knex) => {

  return knex.schema
    .createTable(TABLE_NAME, table)
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });
};

exports.down = (knex) => {

  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped!`);
    });
};
