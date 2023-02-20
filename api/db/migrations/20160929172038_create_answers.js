const TABLE_NAME = 'answers';

export const up = (knex) => {
  function table(t) {
    t.increments().primary();
    t.text('value').notNull();
    t.string('result');
    t.integer('assessmentId').unsigned().references('assessments.id');
    t.string('challengeId').notNull();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema.createTable(TABLE_NAME, table);
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
