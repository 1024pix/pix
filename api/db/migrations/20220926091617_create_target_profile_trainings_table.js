const TABLE_NAME = 'target-profile-trainings';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('targetProfileId').references('target-profiles.id').notNullable();
    t.integer('trainingId').references('trainings.id').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
