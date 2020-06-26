const TABLE_NAME = 'knowledge-element-snapshots';

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.integer('userId').notNullable();
      table.dateTime('createdAt').notNullable();
      table.jsonb('snapshot').notNullable();
      table.index('userId', 'createdAt');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
