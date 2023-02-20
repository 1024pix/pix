const TABLE_NAME = 'certification-center-memberships';

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
