const TABLE_NAME = 'training-trigger-tubes';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('trainingTriggerId').references('training-triggers.id').notNullable();
    t.string('tubeId').notNullable();
    t.integer('level').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    t.unique(['trainingTriggerId', 'tubeId']);
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
