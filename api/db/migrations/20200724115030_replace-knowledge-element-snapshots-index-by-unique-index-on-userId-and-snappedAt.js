const TABLE_NAME = 'knowledge-element-snapshots';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex('userId');
    table.unique(['userId', 'snappedAt']);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index('userId');
    table.dropUnique(['userId', 'snappedAt']);
  });
};
