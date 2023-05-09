const TABLE_NAME = 'snapshots';

const up = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('userId').unsigned().alter();
  });
};

const down = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('userId').unsigned().alter();
  });
};

export { up, down };
