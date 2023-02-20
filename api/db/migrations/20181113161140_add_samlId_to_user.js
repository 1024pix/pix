const TABLE_NAME = 'users';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('samlId').unique();
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('samlId');
  });
};
