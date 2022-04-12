exports.up = function (knex) {
  return knex.schema.table('certification-candidates', function (table) {
    table.unique(['sessionId', 'firstName', 'lastName', 'birthdate']);
  });
};

exports.down = function (knex) {
  return knex.schema.table('certification-candidates', function (table) {
    table.dropUnique(['sessionId', 'firstName', 'lastName', 'birthdate']);
  });
};
