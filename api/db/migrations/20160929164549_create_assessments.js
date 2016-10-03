'use strict';

const TABLE_NAME = 'assessments';

function table(t) {

  t.increments().primary();
  t.integer('user_id').unsigned().references('users.id');
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
