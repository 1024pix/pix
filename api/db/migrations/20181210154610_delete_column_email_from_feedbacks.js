const TABLE_NAME = 'feedbacks';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('email');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('email');
  });
};
