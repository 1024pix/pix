const TABLE_NAME = 'badges';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('altMessage').notNullable();
    table.string('imageUrl').notNullable();
    table.string('message').notNullable();
    table.integer('targetProfileId').references('target-profiles.id').index();
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
