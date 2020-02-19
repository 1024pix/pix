const TABLE_NAME = 'skills';

exports.up = (knex) => {

  return knex.schema
    .dropTable(TABLE_NAME);
};

exports.down = (knex) => {

  function table(t) {
    t.increments().primary();
    t.integer('assessmentId').unsigned().references('assessments.id').index();
    t.string('name').notNull();
    t.string('status').notNull();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table);
};

