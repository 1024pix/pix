const TABLE_NAME = 'knowledge-element-snapshots';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex('userId');
    table.unique(['userId', 'snappedAt']);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index('userId');
    table.dropUnique(['userId', 'snappedAt']);
  });
};

export { up, down };
