const TABLE_NAME = 'certification-courses';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isPublished').notNullable().defaultTo(false);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isPublished');
  });
};
