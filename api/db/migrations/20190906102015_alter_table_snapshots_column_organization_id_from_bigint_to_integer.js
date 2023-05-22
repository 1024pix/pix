const TABLE_NAME = 'snapshots';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('organizationId').unsigned().alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('organizationId').unsigned().alter();
  });
};

export { up, down };
