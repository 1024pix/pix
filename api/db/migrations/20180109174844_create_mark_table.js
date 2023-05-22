const TABLE_NAME = 'marks';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('level').unsigned();
    t.integer('score').unsigned();
    t.text('area_code').notNull();
    t.text('competence_code').notNull();
    t.integer('assessmentId').unsigned().references('assessments.id');
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
