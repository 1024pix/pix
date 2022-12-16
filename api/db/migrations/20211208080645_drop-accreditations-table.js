const TABLE_NAME = 'accreditations';

exports.up = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

exports.down = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('name').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};
