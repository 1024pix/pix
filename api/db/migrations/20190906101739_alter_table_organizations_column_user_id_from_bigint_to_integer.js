const TABLE_NAME = 'organizations';

export const up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('userId').unsigned().alter();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('userId').alter();
  });
};
