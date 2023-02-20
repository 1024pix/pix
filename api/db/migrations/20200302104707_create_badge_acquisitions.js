const TABLE_NAME = 'badge-acquisitions';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.integer('userId').notNullable().references('users.id').index();
    table.integer('badgeId').notNullable().references('badges.id');
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
