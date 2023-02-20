const TABLE_NAME = 'user_tutorials';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.bigInteger('userId').index();
    t.string('tutorialId').notNullable().index();
    t.unique(['userId', 'tutorialId']);
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
