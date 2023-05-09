const up = function (knex) {
  return knex.schema.table('feedbacks', function (table) {
    table.string('userAgent');
  });
};

const down = function (knex) {
  return knex.schema.table('feedbacks', (table) => {
    table.dropColumn('userAgent');
  });
};

export { up, down };
