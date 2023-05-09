const TABLE_NAME = 'certification-courses';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isCancelled').notNullable().defaultTo(false);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isCancelled');
  });
};

export { up, down };
