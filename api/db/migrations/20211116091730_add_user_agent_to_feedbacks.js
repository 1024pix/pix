export const up = function (knex) {
  return knex.schema.table('feedbacks', function (table) {
    table.string('userAgent');
  });
};

export const down = function (knex) {
  return knex.schema.table('feedbacks', (table) => {
    table.dropColumn('userAgent');
  });
};
