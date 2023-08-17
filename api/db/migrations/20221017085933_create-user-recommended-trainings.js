const TABLE_NAME = 'user-recommended-trainings';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('userId').references('users.id').notNullable();
    t.integer('trainingId').references('trainings.id').notNullable();
    t.integer('campaignParticipationId').references('campaign-participations.id').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    t.unique(['userId', 'trainingId', 'campaignParticipationId']);
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
