const TABLE_NAME = 'badge-partner-competences';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('color').nullable().alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('color').notNullable().alter();
  });
};

export { up, down };
