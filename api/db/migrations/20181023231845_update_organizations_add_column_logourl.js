const TABLE_NAME = 'organizations';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text('logoUrl');
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.drop('logoUrl');
  });
};
