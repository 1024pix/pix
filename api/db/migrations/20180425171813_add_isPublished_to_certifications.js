const TABLE_NAME = 'certification-courses';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('isPublished').notNullable().defaultTo(false);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('isPublished');
  });
};
