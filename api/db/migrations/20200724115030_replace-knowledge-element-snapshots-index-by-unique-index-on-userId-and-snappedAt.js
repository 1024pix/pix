const TABLE_NAME = 'knowledge-element-snapshots';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex('userId');
    table.unique(['userId', 'snappedAt']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index('userId');
    table.dropUnique(['userId', 'snappedAt']);
  });
};
