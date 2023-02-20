const TABLE_NAME = 'marks';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('level').unsigned();
    t.integer('score').unsigned();
    t.text('area_code').notNull();
    t.text('competence_code').notNull();
    t.integer('assessmentId').unsigned().references('assessments.id');
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
