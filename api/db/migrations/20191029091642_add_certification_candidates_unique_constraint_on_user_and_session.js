const TABLE_NAME = 'certification-candidates';

exports.up = async function(knex) {

  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['sessionId', 'userId']);
  });
};

exports.down = function(knex) {

  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['sessionId', 'userId']);
  });
};

