const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'creatorId';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).nullable().alter();
  });
};

export { up, down };
