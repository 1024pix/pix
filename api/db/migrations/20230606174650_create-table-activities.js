const TABLE_NAME = 'activities';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('assessmentId').notNullable().unsigned().references('assessments.id');
    t.string('level').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.index('assessmentId');
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
