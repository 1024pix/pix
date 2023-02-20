const TABLE_NAME = 'competence-marks';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('level');
    t.integer('score').unsigned();
    t.text('area_code').notNull();
    t.text('competence_code').notNull();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.integer('assessmentResultId').unsigned().references('assessment-results.id');
    t.index('assessmentResultId');
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
