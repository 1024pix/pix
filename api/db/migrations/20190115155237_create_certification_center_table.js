const TABLE_NAME = 'certification-centers';

exports.up = (knex) => {
  return knex.schema
    .createTable(TABLE_NAME, (t) => {
      t.increments().primary();
      t.string('name').notNullable();
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTable(TABLE_NAME);
};
