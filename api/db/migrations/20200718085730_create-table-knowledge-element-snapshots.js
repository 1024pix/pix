const TABLE_NAME = 'knowledge-element-snapshots';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.integer('userId').notNullable();
    table.dateTime('snappedAt').notNullable();
    table.jsonb('snapshot').notNullable();
    table.index('userId');
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
