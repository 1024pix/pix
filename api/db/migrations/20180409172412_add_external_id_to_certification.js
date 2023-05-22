const TABLE_NAME = 'certification-courses';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('externalId');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('externalId');
  });
};

export { up, down };
