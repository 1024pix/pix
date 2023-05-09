const TABLE_NAME = 'certification-courses';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isPublished').notNullable().defaultTo(false);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isPublished');
  });
};

export { up, down };
