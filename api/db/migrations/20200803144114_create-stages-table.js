const TABLE_NAME = 'stages';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.integer('targetProfileId').notNullable().references('target-profiles.id').index();
    t.string('title').notNullable();
    t.string('message').notNullable();
    t.integer('threshold').notNullable().unsigned();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
