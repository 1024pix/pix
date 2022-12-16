const TABLE_NAME = 'certification-courses';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('externalId');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('externalId');
  });
};
