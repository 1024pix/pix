export const up = (knex) => {
  return knex.schema.table('certification-candidates', (table) => {
    table.index('schoolingRegistrationId');
  });
};

export const down = (knex) => {
  return knex.schema.table('certification-candidates', (table) => {
    table.dropIndex('schoolingRegistrationId');
  });
};
