const TABLE_NAME = 'stages';

const up = function (knex) {
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

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
