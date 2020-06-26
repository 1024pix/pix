const TABLE_NAME = 'knowledge-element-snapshots';

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.integer('userId').notNullable().index();
      table.dateTime('createdAt').notNullable();
      table.jsonb('snapshot').notNullable();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
