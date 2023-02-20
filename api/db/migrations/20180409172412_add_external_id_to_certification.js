const TABLE_NAME = 'certification-courses';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('externalId');
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('externalId');
  });
};
