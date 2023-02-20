const TABLE_NAME = 'organizations';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('email');
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('email');
  });
};
