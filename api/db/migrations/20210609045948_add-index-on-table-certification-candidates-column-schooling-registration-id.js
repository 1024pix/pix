const up = function (knex) {
  return knex.schema.table('certification-candidates', (table) => {
    table.index('schoolingRegistrationId');
  });
};

const down = function (knex) {
  return knex.schema.table('certification-candidates', (table) => {
    table.dropIndex('schoolingRegistrationId');
  });
};

export { up, down };
