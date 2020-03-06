const TABLE_NAME = 'badge-acquisitions';

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
      table.integer('userId').references('users.id').index();
      table.integer('badgeId').references('badges.id');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
