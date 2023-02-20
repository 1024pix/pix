const TABLE_NAME = 'competence-evaluations';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('assessmentId').unsigned().references('assessments.id').index();
    t.integer('userId').unsigned().references('users.id').index();
    t.string('competenceId').index();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
