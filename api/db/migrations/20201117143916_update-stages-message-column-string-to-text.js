const TABLE_NAME = 'stages';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.text('message').alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('message').alter();
  });
};

export { up, down };
