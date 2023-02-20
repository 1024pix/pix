const TABLE_NAME = 'badge-partner-competences';

export const up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('color').nullable().alter();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('color').notNullable().alter();
  });
};
