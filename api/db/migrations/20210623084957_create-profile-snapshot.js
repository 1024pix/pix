const TABLE_NAME = 'profile-snapshots';

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.integer('userId').unsigned().references('users.id').notNullable().index();
      table.integer('knowledgeElementsSnapshotId').unsigned().references('knowledge-element-snapshots.id').notNullable();
      table.dateTime('snappedAt').notNullable();
      table.jsonb('snapshot').notNullable();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
