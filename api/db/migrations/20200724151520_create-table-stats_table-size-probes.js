const TABLE_NAME = 'stats_table_size_probes';

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.string('table_name').notNullable();
      table.integer('total_size_mb').notNullable();
      table.integer('table_size_mb').notNullable();
      table.integer('indexes_size_mb').notNullable();
      table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
