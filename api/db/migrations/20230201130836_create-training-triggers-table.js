const TABLE_NAME = 'training-triggers';

exports.up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('trainingId').references('trainings.id').notNullable();
    t.integer('threshold').checkBetween([0, 100]).notNullable();
    t.string('type').checkIn(['prerequisite', 'goal']).notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    t.unique(['trainingId', 'type']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
