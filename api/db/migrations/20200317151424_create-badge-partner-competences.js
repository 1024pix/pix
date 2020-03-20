const TABLE_NAME = 'badge-partner-competences';

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.specificType('skillIds', 'text[]').notNullable();
      table.string('color').notNullable();
      table.integer('badgeId').references('badges.id').index();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
