'use strict';

const TABLE_NAME = 'users';

function table(t) {

  t.increments().primary();
  t.string('first_name').notNull();
  t.string('last_name').notNull();
  t.string('email').notNull();
  t.string('login').notNull();
  t.string('password').notNull();
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
