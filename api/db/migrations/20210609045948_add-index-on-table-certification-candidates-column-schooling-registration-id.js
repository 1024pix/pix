exports.up = (knex) => {
  return knex.schema.table('certification-candidates', (table) => {
    table.index('schoolingRegistrationId');
  });
};

exports.down = (knex) => {
  return knex.schema.table('certification-candidates', (table) => {
    table.dropIndex('schoolingRegistrationId');
  });
};
