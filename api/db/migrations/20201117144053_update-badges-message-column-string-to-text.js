const TABLE_NAME = 'badges';

export const up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.text('message').alter();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('message').alter();
  });
};
