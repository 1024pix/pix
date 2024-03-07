const TABLE_NAME = 'trainings';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('title').notNullable();
    t.string('link').notNullable();
    t.string('type').notNullable();
    t.specificType('duration', 'interval').notNullable();
    t.string('locale').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
