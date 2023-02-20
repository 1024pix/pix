const TABLE_NAME = 'badge-criteria';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('scope').notNullable();
    table.integer('threshold').notNullable();
    table.integer('badgeId').references('badges.id').index();
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
