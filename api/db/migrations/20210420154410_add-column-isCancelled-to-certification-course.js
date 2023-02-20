const TABLE_NAME = 'certification-courses';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isCancelled').notNullable().defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isCancelled');
  });
};
